const express = require('express')
const { Group, GroupImage, User, Venue, Event, Attendance, Membership } = require('../../db/models')
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();



router.get('/', async (req, res) => {
    const allGroups = await Group.findAll();

    res.json({
        "Groups": allGroups
    })
})

router.get('/current', requireAuth, async (req, res) => {
    const id = req.user.id;
    const allGroups = await Group.findAll({
        where: {
            organizerId: id,
        }
    });

    res.json({
        "Groups": allGroups
    })
})

router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId, {
        include: [{
            model: GroupImage,
            as: "GroupImages",
            attributes: ['id', 'url', 'preview']
        }, {
            model: User,
            as: "Organizer",
        }, {
            model: Venue,
            as: 'Venues',
            attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
        }]
    })
    if (!group) {
        res.status(404)
        return res.json({
            message: "Group couldn't be found",
        })
    }

    res.json(group)
})

router.post('/', requireAuth, async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    const organizerId = req.user.id
    const newGroup = await Group.create({
        organizerId,
        name,
        about,
        type,
        private,
        city,
        state
    })


    res.json(newGroup)
})

router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = Group.findByPk(groupId, {
        where: {
            organizerId: userId
        }
    })

    if (!group) {
        res.status(404);
        return res.json({
            message: "Group couldn't be found"
        })
    }

})

router.put('/:groupId', requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, about, type, private, city, state } = req.body;

    let group = await Group.findByPk(groupId, {
        where: {
            organizerId: userId
        }
    });

    if (!group) {
        res.status(404)
        return res.json({
            "message": "Group couldn't be found"
        })
    }
    group.name = name;
    group.about = about;
    group.type = type;
    group.private = private;
    group.city = city;
    group.state = state;

    await group.save()

    res.json(group)
})

router.delete('/:groupId', async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);

    if (!group) {
        res.json({
            message: "Group couldn't be found"
        })
    }

    await group.destroy()
    res.json({
        message: "Successfully deleted"
    })
})

router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId

    const group = await Group.findByPk(groupId)
    if (!group) {
        res.status(404);
        return res.json({
            "message": "Group couldn't be found"
        })
    }

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    })

    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }

    const venues = await Venue.findAll({
        where: {
            groupId: group.id
        },
        attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
    })

    res.json({
        Venues: venues
    })
})

router.post('/:groupId/venues', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId
    const { address, city, state, lat, lng } = req.body

    const group = await Group.findByPk(groupId)
    if (!group) {
        res.status(404);
        return res.json({
            "message": "Group couldn't be found"
        })
    }

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    })


    if ((group.organizerId !== userId) && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }
    const venues = await Venue.create(
        {
            groupId,
            address,
            city,
            state,
            lat,
            lng
        }, {
        where: {
            groupId: groupId,
        },
    });

    res.json({
        id: venues.id,
        groupId: venues.groupId,
        address: venues.address,
        city: venues.city,
        state: venues.state,
        lat: venues.lat,
        lng: venues.lng
    })
})

router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params

    const group = Group.findByPk(groupId)

    if (!group) return res.status(404).json({ message: "Group couldn't be found" })

    const events = await Event.findAll({ where: { groupId: groupId } })

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

})

router.post('/:groupId/events', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" })

    const venue = await Venue.findOne({
        groupId: group.id
    });

    if (!venue) return res.status(404).json({ "message": "Venue couldn't be found" })

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
    const event = await group.createEvent(req.body);

    let result = {
        id: event.id,
        groupId: group.id,
        venueId: venue.id,
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

router.get('/:groupId/members', async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    let members = await group.getUsers({ joinTableAttributes: ['status'] })

    if (membership.length < 1) members = members.filter(member => member.Membership.status !== 'pending')
    else if ((group.organizerId !== userId) && membership[0].status !== 'co-host') members = members.filter(member => member.Membership.status !== 'pending')

    res.json({ Members: members })

})

router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { groupId } = req.params;

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" })

    const memberships = await Membership.findAll({
        where: {
            groupId: groupId,
            userId, userId
        }
    })

    if (memberships.length > 0) {
        if (memberships[0].status === 'pending') return res.status(400).json({ "message": "Membership has already been requested" });
        if (memberships[0].status === ('member' || 'co-host')) return res.status(400).json({ "message": "User is already a member of the group" });
    }

    const membership = await Membership.create({
        userId: userId,
        groupId: groupId
    })

    res.json({
        memberId: membership.userId,
        status: membership.status
    })
})

router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { groupId } = req.params;
    const { memberId, status } = req.body
    const group = await Group.findByPk(groupId);

    const member = await User.findByPk(memberId);

    if (!member) return res.status(404).json({ "message": "Membership between the user and the group does not exist" })
    if (!group) return res.status(404).json({ "message": "Group couldn't be found" })

    const memberships = await Membership.findAll({
        attributes: ['id', 'groupId', 'userId', 'status'],
        where: {
            groupId: groupId,
            userId, userId
        }
    })
    const membership = memberships[0]

    if (memberships.length === 0) res.status(404).json({ "message": "Membership between the user and the group does not exist" })

    if ((group.organizerId !== userId) && membership.status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }
    if (status === 'co-host' && group.organizerId !== userId) return res.status(403).json({ "message": "Only group organizer can access this page." })

    membership.status = status || membership.status;

    await membership.save()

    res.json({
        id: membership.id,
        groupId: membership.groupId,
        memberId: membership.userId,
        status: membership.status
    })
})

router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    const userId = req.user.id
    const { groupId, memberId } = req.params;

    let member = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: memberId
        }
    })
    if (member) {
        member = member.toJSON()
    }
    if (!member) return res.status(404).json({ "message": "User couldn't be found" })

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" })

    let membership = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: userId,
        }
    })

    if (!membership) return res.status(404).json({ "message": "Membership does not exist for this User" })

    membership = membership.toJSON()

    if (member.userId !== userId && membership.status !== 'host') return res.status(403).json({ "Forbidden": "You cannot access this page." })

    await Membership.destroy({
        where: {
            groupId: groupId,
            userId: memberId
        }
    })
    res.json({ "message": "Successfully deleted membership from group" })

})

module.exports = router

