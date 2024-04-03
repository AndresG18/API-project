'use strict';
const { Op } = require('sequelize')
/** @type {import('sequelize-cli').Migration} */

const { Membership } = require('../models')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const memberships = [
  {
    userId:3,
    groupId:1,
    status:"organizer",
  }, 
  {
    userId:3,
    groupId:2,
    status:"co-host",
  },
  {
    userId:3,
    groupId:3,
    status:"member",
  },
  {
    userId:2,
    groupId:2,
    status:"organizer",
  },
  {
    userId:2,
    groupId:1,
    status:"co-host",
  },
  {
    userId:2,
    groupId:3,
    status:"member",
  },
  {
    userId:1,
    groupId:1,
    status:"member",
  },
  {
    userId:1,
    groupId:2,
    status:"member",
  },
  {
    userId:1,
    groupId:3,
    status:"organizer",
  }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    await Membership.bulkCreate(memberships,{validate:true})
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships'
    await queryInterface.bulkDelete(options,{
      groupId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
