'use strict';
const { Venue } = require('../models')
/** @type {import('sequelize-cli').Migration} */
const { Op } = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const venues = [
  {
    groupId: 1,
    address: "123 E Health Dr",
    city: "Phoenix",
    state: "Arizona",
    lat: 33.448376,
    lng: -112.074036,
  }, {
    groupId: 2,
    address: "345 W SkinCare Dr",
    city: "Chandler",
    state: "Arizona",
    lat: 33.307575,
    lng: -111.844940,
  }, {
    groupId: 3,
    address: "567 N Gamer Dr",
    city: "Maricopa",
    state: "Arizona",
    lat: 33.05811000,
    lng: -112.04764000,
  }
]
module.exports = {
  async up(queryInterface, Sequelize) {
    await Venue.bulkCreate(venues, { validate: true })
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Venues'
    await queryInterface.bulkDelete(options,{
      groupId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
