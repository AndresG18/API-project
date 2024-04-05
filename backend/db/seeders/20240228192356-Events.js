'use strict';
const { Event } = require('../models')
/** @type {import('sequelize-cli').Migration} */
const {Op} = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const events = [
  {
    venueId: 1,
    groupId: 1,
    name: 'Take the 1st step into a healthy life.',
    description: 'We will talk about how to implement healthy changes or alternatives to ur diet, as well as how to start doing exercise.',
    type: "In person",
    capacity: 40,
    price: 10,
    startDate: '2024-8-18',
    endDate: '2024-8-19',
  }, {
    venueId: 2,
    groupId: 2,
    name: 'Start your skin journey today!.',
    description: 'We will talk about where and how to start skin care based on your skin type',
    type: "In person",
    capacity: 20,
    price: 10,
    startDate: '2024-9-21',
    endDate: '2024-9-22',
  },
  {
    venueId: 3,
    groupId: 3,
    name: 'Games n Fun!',
    description: 'We will have arcade games,video games and board games for you to play with your friends and family!',
    type: "In person",
    capacity: 30,
    price: 20,
    startDate: '2024-10-12',
    endDate: '2024-10-13',
  }
]
module.exports = {
  async up(queryInterface, Sequelize) {
    await Event.bulkCreate(events, { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Events'
    await queryInterface.bulkDelete(options,{
      groupId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
