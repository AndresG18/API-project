const express = require('express')
const { Group, GroupImage, User, Venue, Event, Attendance, Membership } = require('../../db/models')
const { Op } = require('sequelize');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

router.delete('/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId;
    const userId = req.user.id;

    parseInt(imageId);
    if(isNaN(imageId)) return res.status(404).json({"message": "Group Image couldn't be found" });

    const image = await GroupImage.findByPk(imageId);
    console.log(image)

    if (!image) return res.status(404).json({ "message": "Event Image couldn't be found" });

    const group = await Group.findByPk(image.groupId);

    if (!group) return res.status(404).json({ "message": "Group couldn't be found" });

    let membership = await Membership.findOne({
        where: {
            groupId: image.groupId,
            userId: userId,
        }
    });

    if (!membership) return res.status(404).json({ "message": "Membership does not exist for this User" });

    membership = membership.toJSON();

    if (group.organizerId !== userId && membership.status !== 'co-host') {
        return res.status(403).json({
            error: " Forbidden : Only group organizers or co-hosts can access this page."
        })
    };

    await image.destroy();

    res.json({
        "message": "Successfully deleted"
    });
});


module.exports = router