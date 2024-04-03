'use strict';
const { Op } = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { Attendance } = require('../models')

const attendances = [
  {
    eventId: 1,
    userId: 1,
    status: 'pending'
  },
  {
    eventId: 1,
    userId: 2,
    status: 'attending'
  },
  {
    eventId: 1,
    userId: 3,
    status: 'attending'
  },
  {
    eventId: 2,
    userId: 1,
    status: 'pending'
  },
  {
    eventId: 2,
    userId: 2,
    status: 'attending'
  },
  {
    eventId: 2,
    userId: 3,
    status: 'attending'
  },
  {
    eventId: 3,
    userId: 1,
    status: 'attending'
  },
  {
    eventId: 3,
    userId: 2,
    status: 'attending'
  }, {
    eventId: 3,
    userId: 3,
    status: 'attending'
  },
]
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Attendance.bulkCreate(attendances, { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Attendances'
    await queryInterface.bulkDelete(options,{
      userId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
