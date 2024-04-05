const express = require('express')
const { Group, GroupImage, User, Venue, Event, Attendance, Membership } = require('../../db/models')
const { Op, ValidationError } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const { validateGroup, validateVenue, validateEvent } = require('../../utils/validation');
const router = express.Router();

// GET all groups *
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

        let image = await group.getGroupImages({ attributes: ['url'] });

        if (image.length < 1) image = null;
        else image = image[0].url;

        group = group.toJSON()

        let result = {
            ...group,
            numMembers,
            previewImage: image,
        };

        all.push(result);
    }

    res.json({ "Groups": all });
});

// GET current user's groups*
router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id;

    const allGroups = await Group.findAll({
        where: {
            organizerId: userId
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

        let image = await group.getGroupImages({
            attributes: ['url']
        });

        if (image.length < 1) image = null;
        else image = image[0].url;

        group = group.toJSON()

        let result = {
            ...group,
            numMembers,
            previewImage: image,
        };

        all.push(result);
    }

    res.json({ "Groups": all });
});

// GET group by ID
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const numMembers = await group.countUsers();

    const GroupImages = await group.getGroupImages({ attributes: ['id', 'url', 'preview'] });

    const Organizer = await group.getOrganizer({ attributes: ['id', 'firstName', 'lastName'] });

    const Venues = await group.getVenues({ attributes: { exclude: ['createdAt', 'updatedAt'] } });

    res.json({
        ...group.toJSON(),
        numMembers,
        GroupImages,
        Organizer,
        Venues
    });
});


// POST new group
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    const organizerId = req.user.id;

    const newGroup = await Group.create({
        organizerId: organizerId,
        name: name,
        about: about,
        type: type,
        private: private,
        city: city,
        state: state
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

    if (group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    let image = await group.createGroupImage(req.body);

    let result = {
        id: image.id,
        url: image.url,
        preview: image.preview,
    };

    res.json(result);

});

// PUT update group
router.put('/:groupId', requireAuth, validateGroup, async (req, res) => {
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

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });


    if (group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

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
    const userId = req.user.id

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" })

    if (group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    await group.destroy();

    res.json({ message: "Successfully deleted" });
});

// GET group venues
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    let membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    membership = membership[0]

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
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
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const { address, city, state, lat, lng } = req.body;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    let membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    if (membership.length > 0) membership = membership[0];
    else membership = { status: null }

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
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

    if (events.length < 1) {
        const testGroup = await Group.findByPk(groupId);
        if (!testGroup) return res.status(404).json({ message: "Group couldn't be found" });
    }
    const allEvents = [];
    for (let i = 0; i < events.length; i++) {
        let event = events[i];

        const group = await Group.findByPk(event.groupId, {
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
        let image = await group.getGroupImages({ attributes: ['url'] });

        if (image.length < 1) image = null;
        else image = image[0].url;

        let result = {
            id: event.id,
            groupId: group.id,
            venueId: event.venueId,
            name: event.name,
            type: event.type,
            startDate: event.startDate.toUTCString(),
            endDate: event.endDate.toUTCString(),
            numAttending: numAttending,
            previewImage: image,
            Group: group || null,
            Venue: venue || null,
        };
        allEvents.push(result);
    }
    res.json({ "Events": allEvents });
});

// POST group event
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const venueId = req.body.venueId

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const venue = await Venue.findByPk(venueId)

    if (!venue) return res.status(404).json({ "message": "Venue couldn't be found" });

    let membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId
        }
    });

    if (membership.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });
    else membership = membership[0];

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
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

// GET group members *
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

    if (membership.length < 1) members = members.filter(member => member.Membership.status !== 'pending');
    else if ((group.organizerId !== userId) && membership[0].status !== 'co-host') members = members.filter(member => member.Membership.status !== 'pending');

    res.json({ Members: members });
});

// POST group membership *
router.post('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    let memberships = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: userId
        }
    });

    if (memberships) {
        memberships = memberships.toJSON();
        if (memberships.status === 'pending') return res.status(400).json({ "message": "Membership has already been requested" });
        if (memberships.status !== 'pending') return res.status(400).json({ "message": "User is already a member of the group" });
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

// PUT update group membership *
router.put('/:groupId/membership', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    const { memberId, status } = req.body;

    parseInt(groupId);
    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const member = await User.findByPk(memberId);

    if (!member) return res.status(404).json({ "message": "User couldn't be found" });

    if (status === 'host' && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });
    if (status === 'pending') return res.status(400).json({
        "message": "Bad Request",
        "errors": {
            "status": "Cannot change a membership status to pending"
        }
    });

    const members = await Membership.findAll({
        attributes:['id','groupId','userId','status'],
        where: {
            groupId: groupId,
            userId: memberId,
        }
    });
    if (members.length < 1) return res.status(404).json({ "message": "Membership between the user and the group does not exist" });

    const memberships = await Membership.findAll({
        where: {
            groupId: groupId,
            userId, userId
        }
    });

    if (memberships.length < 1 && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    const membership = memberships[0];

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({ "message": "Forbidden" });
    }
    if (status === 'co-host' && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    members[0].status = status || members.status;

    await members[0].save();

    res.json({
        id: members[0].id,
        groupId: members[0].groupId,
        memberId: members[0].userId,
        status: members[0].status
    });
});

// DELETE group membership *
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { groupId, memberId } = req.params;

    parseInt(groupId);
    parseInt(memberId);

    if (isNaN(groupId)) return res.status(404).json({ "message": "Group couldn't be found" });
    if (isNaN(memberId)) return res.status(404).json({ "message": "Member couldn't be found" });

    const group = await Group.findByPk(groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    const user = await User.findByPk(memberId)

    if (!user) return res.status(404).json({ "message": "User couldn't be found" });

    let member = await Membership.findOne({
        where: {
            groupId: groupId,
            userId: memberId
        }
    });
    if (member) {
        member = member.toJSON();
    }
    if (!member) return res.status(404).json({ "message": "Membership does not exist for this User" });;


    let membership = await Membership.findAll({
        where: {
            groupId: groupId,
            userId: userId,
        }
    });

    membership = membership[0];

    if (member.userId !== userId && group.organizerId !== userId) return res.status(403).json({ "message": "Forbidden" });

    await Membership.destroy({
        where: {
            groupId: groupId,
            userId: memberId
        }
    });
    res.json({ "message": "Successfully deleted membership from group" });
});

module.exports = router