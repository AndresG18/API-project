const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../utils/auth');
const { Group, GroupImage, User, Venue, Attendance, EventImage, Membership, Event } = require('../../db/models');
const { validateEvent } = require('../../utils/validation')
const group = require('../../db/models/group');

// GET Single Event by id *
router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found." });

    const group = await event.getGroup({ attributes: ['id', 'name', 'private', 'city', 'state'] });

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const venue = await event.getVenue({ attributes: { exclude: ['createdAt', 'updatedAt'] } })

    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" });

    const numAttending = await Attendance.count({
        where: {
            eventId: event.id
        }
    });

    const image = await event.getEventImages({ attributes: ['id', 'url', 'preview'] });

    const eventPojo = await event.toJSON();
    const result = {
        ...eventPojo,
        numAttending: numAttending,
        Group: group || null,
        Venue: venue || null,
        EventImages: image,
    };

    res.json(result);
});

// GET All Events with Pagination *
router.get('/', async (req, res) => {
    let { page, size } = req.query;

    if (isNaN(page) || page < 1 || page > 10) page = 1;
    if (isNaN(size) || size < 1 || size > 20) size = 20;

    
    const pagination = {
        limit: size,
        offset: (page - 1) * size
    };

    const events = await Event.findAll({
        ...pagination
    });

    const allEvents = [];

    for (let i = 0; i < events.length; i++) {
        let event = events[i];

        const group = await event.getGroup({
            attributes: ['id', 'name', 'city', 'state']
        });

        if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

        const venue = await event.getVenue({
            attributes: ['id', 'city', 'state']
        });

        if (!venue) return res.status(404).json({ message: "Venue couldn't be found" });

        const numAttending = await Attendance.count({
            where: {
                eventId: event.id
            }
        });

        let image = await event.getEventImages({
            attributes: ['url']
        });

        if (image.length < 1) image = null;
        else image = image[0].url;

        let result = {
            id: event.id,
            groupId: group.id,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: numAttending,
            previewImage: image,
            group: group || null,
            Venue: venue || null,
        };
        allEvents.push(result);
    }

    res.json({
        "Events": allEvents,
        page,
    });
});

// POST Event Image *
router.post('/:eventId/images', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) res.status(404).json({ "message": "Event couldn't be found" });

    const group = await Group.findByPk(event.groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    if ((group.organizerId !== userId) && membership[0].status !== ('co-host' || 'attendee')) {
        return res.status(403).json({ "message": "Forbidden" });
    }

    let image = await event.createEventImage(req.body);

    let result = {
        id: image.id,
        url: image.url,
        preview: image.preview,
    };

    res.json(result);
});

// PUT Update Event *
router.put('/:eventId', requireAuth, validateEvent, async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: " Event couldn't be found." });

    const venue = await Venue.findByPk(event.venueId);

    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" });

    const group = await Group.findByPk(event.groupId);

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });


    if (membership.length < 1 && group.organizerId !== organizerId) return res.status(403).json({ "message": "Forbidden" });

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
    }

    await event.update(req.body);

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
    };

    res.json(result);
});

// DELETE Event *
router.delete('/:eventId', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

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

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
    }
    await event.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

// GET Event Attendees
router.get('/:eventId/attendees', async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    let attendees = await event.getUsers({ joinTableAttributes: ['status'] });

    const membership = await Membership.findAll({
        where: {
            groupId: event.groupId,
            userId: userId,
        }
    });

    if (membership.length < 1) attendees = attendees.filter(attendee => attendee.status !== 'pending');
    else if (membership[0].status !== ('co-host' && 'host')) attendees = attendees.filter(attendee => attendee.status !== 'pending');

    res.json({ Attendees: attendees });
});

// POST Attendance Request *
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    const attendance = await Attendance.findAll({
        where: {
            eventId: eventId,
            userId: userId
        }
    });

    if (attendance.length == 1) {
        if (attendance[0].status === 'pending') return res.status(400).json({ "message": "Attendance has already been requested" });
        if (attendance[0].status === 'attending') return res.status(400).json({ "message": "User is already an attendee of the event" });
        else return res.status(404).json({ message: "User already has an attendance status, edit or remove the existing one." });
    }

    let createdAttendance = await Attendance.create({
        eventId: eventId,
        userId: userId
    });

    res.json({
        userId: userId,
        status: createdAttendance.status
    });
});

// PUT Update Attendance *
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { userId, status } = req.body;
    const eventId = req.params.eventId;
    const myId = req.user.id;

    parseInt(eventId);
    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    let group = await event.getGroup();

    if (group !== null) group = group.toJSON()

    const user = await User.findByPk(userId)

    if (!user) return res.status(404).json({ "message": "User couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: myId,
        }
    });

    if (membership.length < 1 && group.organizerId !== myId) return res.status(403).json({ "message": "Forbidden" });

    if (group.organizerId !== myId && membership[0].status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
    }

    const attendance = await Attendance.findAll({
        attributes: ['id', 'eventId', 'userId', 'status'],
        where: {
            eventId: eventId,
            userId: userId,
        }
    });

    if (status === 'pending') return res.status(400).json({
        "message": "Bad Request",
        "errors": {
            "status": "Cannot change an attendance status to pending"
        }
    });

    if (attendance.length < 1) return res.status(404).json({ "message": "Attendance between the user and the event does not exist" });


    if (status === 'attending') attendance[0].status = status;

    await attendance[0].save();

    res.json({
        id: attendance[0].id,
        eventId: eventId,
        userId: userId,
        status: attendance[0].status
    });
});

// DELETE Attendance *
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    const { eventId, userId } = req.params;
    const myId = req.user.id;

    parseInt(eventId);
    parseInt(userId);

    if (isNaN(eventId)) return res.status(404).json({ "message": "Event couldn't be found" });

    if (isNaN(userId)) return res.status(404).json({ "message": "User couldn't be found" });

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ message: "Event couldn't be found" });

    const user = await User.findByPk(userId)

    if (!user) return res.status(404).json({ "message": "User couldn't be found" });

    let group = await event.getGroup();

    if (group !== null) group = group.toJSON()

    console.log(userId,myId)
    if (userId != myId && group.organizerId !== myId) return res.status(403).json({ "message": "Forbidden" });;

    let attendance = await Attendance.findAll({
        where: {
            eventId: eventId,
            userId: userId,
        }
    });

    if (attendance.length < 1) return res.status(404).json({ "message": "Attendance does not exist for this User" });

    attendance = attendance[0];

    await attendance.destroy();

    res.json({
        "message": "Successfully deleted attendance from event"
    });
});



module.exports = router