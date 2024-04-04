const express = require('express')
const { Group, GroupImage, User, Venue, Attendace, EventImage, Membership, Event } = require('../../db/models')
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { validationResult } = require('express-validator');


router.put('/:venueId', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { venueId } = req.params

    if(isNaN(venueId)) return res.status(404).json({ "message": "Venue couldn't be found"});

    const venue = await Venue.findByPk(venueId, {
        attributes: ['id', 'groupId', 'address', 'city', 'state', 'lat', 'lng']
    })

    if (!venue) {
        res.status(404)
        return res.json({
            "message": "Venue couldn't be found"
        })
    }
    let group= await venue.getGroup()

    group = group.toJSON()

    const membership = await Membership.findAll({
        where: {
            groupId: group.id,
            userId: userId,
        }
    })

    if (group.organizerId !== userId && membership[0].status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        });
    }

    const { address, city, state, lat, lng } = req.body;

    venue.address = address || venue.address;
    venue.city = city || venue.city;
    venue.state = state || venue.state;
    venue.lat = lat || venue.lat;
    venue.lng = lng || venue.lng;

    await venue.save()

    res.json(venue)

})

module.exports = router