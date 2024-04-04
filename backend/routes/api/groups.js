const express = require('express')
const { Group, GroupImage, User, Venue, Event, Attendance, Membership } = require('../../db/models')
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// GET all groups
router.get('/', async (req, res) => {
    const allGroups = await Group.findAll();

    const all = []
    for (let i = 0; i < allGroups.length; i++) {
        let group = allGroups[i];

        const numMembers = await Membership.count({
            where: {
                groupId: group.id
            }
        });

        const image = await group.getGroupImages({
            attributes: ['url']
        });

        let result = {
            ...group,
            numMembers,
            previewImage: image[0]
        };

        all.push(result);
    }

    res.json({
        "Groups": all
    });
});

// GET current user's groups
router.get('/current', requireAuth, async (req, res) => {
    const id = req.user.id;
    const allGroups = await Group.findAll({
        where: {
            organizerId: id,
        }
    });

    const all = []
    for (let i = 0; i < allGroups.length; i++) {
        let group = allGroups[i];

        const numMembers = await Membership.count({
            where: {
                groupId: group.id
            }
        });

        const image = await group.getGroupImages({
            attributes: ['url']
        });

        let result = {
            ...group,
            numMembers,
            previewImage: image[0]
        };

        all.push(result);
    }

    res.json({
        "Groups": all
    });
});

// GET group by ID
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

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
    });
    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    res.json(group);
});

// POST new group
router.post('/', requireAuth, async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    const organizerId = req.user.id;

    const newGroup = await Group.create({
        organizerId,
        name,
        about,
        type,
        private,
        city,
        state
    });

    res.status(201).json(newGroup);
});

// POST group images
router.post('/:groupId/images', requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId, {
        where: {
            organizerId: userId
        }
    });

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    if (group.organizerId !== userId) return res.status(403).json({ message: "You are not the group organizer." });

    let image = await group.createGroupImage(req.body);

    let result = {
        id: image.id,
        url: image.url,
        preview: image.preview,
    };

    res.json(result);

});

// PUT update group
router.put('/:groupId', requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, about, type, private, city, state } = req.body;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    let group = await Group.findByPk(groupId, {
        where: {
            organizerId: userId
        }
    });

    if (!group) {
        res.status(404);
        return res.json({
            "message": "Group couldn't be found"
        });
    }

    if (group.organizerId !== userId) return res.status(403).json({ message: "You are not the group organizer." });

    group.name = name;
    group.about = about;
    group.type = type;
    group.private = private;
    group.city = city;
    group.state = state;

    await group.save();

    res.json(group);
});

// DELETE group
router.delete('/:groupId', requireAuth, async (req, res) => {
    const groupId = req.params.groupId
    // const userId = req.user.id

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) {
        res.json({
            message: "Group couldn't be found"
        });
    }

    if (group.organizerId !== req.user.id) return res.status(403).json({ message: "You are not the group organizer." });

    await group.destroy();

    res.json({
        message: "Successfully deleted"
    });
});

// GET group venues
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);
    if (!group) {
        res.status(404);
        return res.json({
            "message": "Group couldn't be found"
        });
    }

    let membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ message: "User does not have this permission" });

    membership = membership[0]

    if ((group.organizerId !== userId) && membership.status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }

    const venues = await Venue.findAll({
        where: {
            groupId: group.id
        },
        attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
    });

    res.json({
        Venues: venues
    });
});

// POST group venue
router.post('/:groupId/venues', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const { address, city, state, lat, lng } = req.body;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ message: "User does not have this permission" });

    if (group.organizerId !== userId && membership[0].status !== 'co-host') {
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
    });
});

// GET group events
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params;


    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const events = await Event.findAll({ where: { groupId: groupId } });

    const allEvents = [];
    for (let i = 0; i < events.length; i++) {
        let event = events[i];

        const group = await event.getGroup({
            attributes: ['id', 'name', 'city', 'state']
        });

        if (!group) return res.status(404).json({ message: "Group couldn't be found" });

        const venue = await event.getVenue({
            attributes: ['id', 'city', 'state']
        });

        const numAttending = await Attendance.count({
            where: {
                eventId: event.id
            }
        });
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
        };
        allEvents.push(result);
    }
    res.json({ "Events": allEvents });
});

// POST group event
router.post('/:groupId/events', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const venue = await Venue.findOne({
        id:req.body.venueId
    });

    if (!venue) return res.status(404).json({ "message": "Venue couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ message: "User does not have this permission"});

    if (group.organizerId !== userId && membership[0].status !== 'co-host') {
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
    };

    res.json(result);
});

// GET group members
router.get('/:groupId/members', async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    let members = await group.getUsers({ joinTableAttributes: ['status'] });

    if (membership.length < 1 && group.organizerId !== userId) members = members.filter(member => member.Membership.status !== 'pending');
    else if ((group.organizerId !== userId) && membership[0].status !== 'co-host') members = members.filter(member => member.Membership.status !== 'pending');

    res.json({ Members: members });
});

// POST group membership
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const memberships = await Membership.findAll({
        where: {
            groupId: groupId,
            userId, userId
        }
    });

    if (memberships.length > 0) {
        if (memberships[0].status === 'pending') return res.status(400).json({ "message": "Membership has already been requested" });
        if (memberships[0].status === ('member' || 'co-host' || group.organizerId === userId)) return res.status(400).json({ "message": "User is already a member of the group" });
    }

    const membership = await Membership.create({
        userId: userId,
        groupId: groupId
    });

    res.json({
        memberId: membership.userId,
        status: membership.status
    });
});

// PUT update group membership
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { memberId, status } = req.body;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    const member = await User.findByPk(memberId);

    if (!member) return res.status(404).json({ "message": "Membership between the user and the group does not exist" });
    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const memberships = await Membership.findAll({
        attributes: ['id', 'groupId', 'userId', 'status'],
        where: {
            groupId: groupId,
            userId, userId
        }
    });

    if (memberships.length < 1 && group.organizerId !== userId) res.status(404).json({  });

    const membership = memberships[0];

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }
    if (status === 'co-host' && group.organizerId !== userId) return res.status(403).json({ "message": "Only group organizer can access this page." });

    membership.status = status || membership.status;

    await membership.save();

    res.json({
        id: membership.id,
        groupId: membership.groupId,
        memberId: membership.userId,
        status: membership.status
    });
});

// DELETE group membership
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId, memberId } = req.params;

    parseInt(groupId);
    parseInt(memberId);

    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });
    if (isNaN(memberId)) return res.status(404).json({ "message": "Member couldn't be found" });

    let member = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: memberId
        }
    });
    if (member) {
        member = member.toJSON();
    }
    if (!member) return res.status(404).json({ "message": "User couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    let membership = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: userId,
        }
    });

    if (!membership && group.organizerId !== userId) return res.status(403).json({ message: "User does not have this permission"});

    membership = membership.toJSON();

    if (member.userId !== userId && group.organizerId !== userId) return res.status(403).json({ "Forbidden": "You cannot access this page." });

    await Membership.destroy({
        where: {
            groupId: groupId,
            userId: memberId
        }
    });
    res.json({ "message": "Successfully deleted membership from group" });
});

module.exports = router

