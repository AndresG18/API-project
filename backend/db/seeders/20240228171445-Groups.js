'use strict';
const { Group } = require('../models')
const { Op } = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const groups = [
  {
    organizerId: 3,
    name: 'Nutrition and Health',
    about: "Learn about diet, physical health and how to manage your weight in a healthy way.",
    type: 'Health',
    private: false,
    city: 'Phoenix',
    state: 'Arizona'

  }, {
    organizerId: 2,
    name: 'SkinCare',
    about: "Skincare and how to take care of certain skin types as well as how to handle specific skin issues like breakouts,scarring,sun damge etc. with our events and talks.",
    type: 'Beauty',
    private: true,
    city: 'Chandler',
    state: 'Arizona'
  }, {
    organizerId: 1,
    name: 'Games n Fun',
    about: "Play video games,board games and have fun with friends.",
    type: 'Entertainment',
    private: false,
    city: 'Maricopa',
    state: 'Arizona'
  }
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Group.bulkCreate(groups, { validate: true });

  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Groups'
    await queryInterface.bulkDelete(options,{
      organizerId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
