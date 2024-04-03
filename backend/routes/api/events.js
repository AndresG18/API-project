const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../utils/auth');
const { Group, GroupImage, User, Venue, Attendance, EventImage, Membership, Event } = require('../../db/models');
const group = require('../../db/models/group');

router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)

    if (!event) return res.status(404).json({ message: " Event couldn't be found." })

    const group = await event.getGroup({
        attributes: ['id', 'name', 'city', 'state']
    })

    const venue = await event.getVenue({
        attributes: ['id', 'city', 'state']
    })

    const numAttending = await Attendance.count({
        where: {
            eventId: event.id
        }
    })
    const images = await event.getEventImages({
        attributes: ['id', 'url', 'preview']
    });

    const eventPojo = await event.toJSON()
    let result = {
        ...eventPojo,
        numAttending: numAttending,
        group: group || null,
        Venue: venue || null,
        EventImages: images
    }

    res.json(result)
})

router.get('/', async (req, res) => {

    const events = await Event.findAll()
    const allEvents = []
    for (let i = 0; i < events.length; i++) {
        let event = events[i]

        const group = await event.getGroup({
            attributes: ['id', 'name', 'city', 'state']
        })

        const venue = await event.getVenue({
            attributes: ['id', 'city', 'state']
        })

        const numAttending = await Attendance.count({
            where: {
                eventId: event.id
            }
        })
        const image = await event.getEventImages({
            attributes: ['url']
        });
        let result = {
            id: event.id,
            groupId: group.id,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: numAttending,
            previewImage: image[0].url,
            group: group || null,
            Venue: venue || null
        }
        allEvents.push(result)
    }

    res.json({ "Events": allEvents })

});

router.post('/:eventId/images', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)

    if (!event) res.status(404).json({ "message": "Event couldn't be found" });

    const group = await Group.findByPk(event.groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    })

    if ((group.organizerId !== userId) && membership[0].status !== ('co-host' || 'attendee')) {
        return res.status(403).json({
            error: " Forbidden : Only attendees, group organizers or co-hosts can access this page."
        });
    }

    let image = await event.createEventImage(req.body)

    let result = {
        id: image.id,
        url: image.url,
        preview: image.preview,
    }

    res.json(result)
})

router.put('/:eventId', async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params

    const event = await Event.findByPk(eventId)

    const venue = await Venue.findByPk(event.venueId)

    const group = await Group.findByPk(event.groupId)

    if (!event) return res.status(404).json({ message: " Event couldn't be found." })

    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" })

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }

    event.update(req.body)

    let result = {
        id: event.id,
        venueId: event.venueId,
        name: event.name,
        type: event.type,
        capacity: event.capacity,
        price: event.price,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate
    }

    res.json(result)
})

router.delete('/:eventId', async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    const group = await Group.findByPk(event.groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }
    await event.destroy()

    res.json({
        message: "Successfully deleted"
    })
})

router.get('/:eventId/attendees', async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    let attendees = await event.getUsers({ joinTableAttributes: ['status'] });

    const membership = await Membership.findAll({
        where: {
            groupId: event.groupId,
            userId: userId,
        }
    })

    if (membership.length < 1) attendees = attendees.filter(attendee => attendee.status !== 'pending')
    else if (membership[0].status !== ('co-host' && 'host')) attendees = attendees.filter(attendee => attendee.status !== 'pending')

    res.json({ Attendees: attendees })
})

router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    const membership = await Membership.findOne({
        where: {
            groupId: event.groupId,
            userId: userId,
        }
    })

    if (!membership) return res.status(404).json({ message: "User is not a member of the group" });

    const attendance = await Attendance.findAll({
        where: {
            eventId: eventId,
            userId: userId
        }
    })

    if (attendance.length == 1) {
        if (attendance[0].status === 'pending') return res.status(400).json({ "message": "Attendance has already been requested" });
        if (attendance[0].status === 'attending') return res.status(400).json({ "message": "User is already an attendee of the event" });
        else return res.status(404).json({ message: "User already has an attendance status, edit or remove the existing one." })
    };

    let createdAttendance = await Attendance.create({
        eventId: eventId,
        userId: userId
    });

    res.json({
        userId: userId,
        status: createdAttendance.status
    })
})

router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { userId, status } = req.body
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    const group = await event.getGroup();

    const user = await User.findAll({
        where: {
            id: userId
        }
    })

    if (user.length < 1) return res.status(404).json({ "message": "User couldn't be found" })

    const membership = await Membership.findAll({
        where: {
            groupId: event.groupId,
            userId: req.user.id,
        }
    })

    if (membership.length < 1) return res.status(404).json({ message: "User is not a member of the group" });

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }

    const attendance = await Attendance.findAll({
        attributes: ['id', 'eventId', 'userId', 'status'],
        where: {
            eventId: eventId,
            userId: userId,
        }
    })

    if (attendance.length < 1) return res.status(404).json({ "message": "Attendance between the user and the event does not exist" })

    if (status === 'pending') return res.status(400).json({
        "message": "Bad Request",
        "errors": {
            "status": "Cannot change an attendance status to pending"
        }
    })

    if (status === 'attending') attendance[0].status = status;

    await attendance[0].save();

    res.json({
        id: attendance[0].id,
        eventId: eventId,
        userId: userId,
        status: attendance[0].status
    })
})

// router.delete('/:eventID')


module.exports = router