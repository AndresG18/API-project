'use strict';
const {Op} = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { EventImage } = require('../models')
const images = [
  {
    eventId:1,
    url:'image6.url',
    preview:true,
  },{
    eventId:2,
    url:'image7.url',
    preview:true,
  },{
    eventId:3,
    url:'image8.url',
    preview:true
  },

]
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await EventImage.bulkCreate(images,{validate:true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'EventImages'
    await queryInterface.bulkDelete(options,{
      eventId:{
        [Op.in] :[1,2,3]
      }
    })
  }
};
