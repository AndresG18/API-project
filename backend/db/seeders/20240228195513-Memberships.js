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
    status:"active",
  },
  {
    userId:2,
    groupId:2,
    status:"active",
  },
  {
    userId:1,
    groupId:1,
    status:"active",
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
