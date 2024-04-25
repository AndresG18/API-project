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
    url:'https://lamvascular.com/wp-content/uploads/2017/02/GettyImages-515311245-550x462.jpg',
    preview:true,
  },{
    eventId:2,
    url:'https://img.freepik.com/free-photo/top-view-cosmetic-treatment_23-2148574964.jpg?size=626&ext=jpg&ga=GA1.1.553209589.1713916800&semt=ais',
    preview:true,
  },{
    eventId:3,
    url:'https://cdna.artstation.com/p/assets/images/images/064/920/110/large/lauan-s-pereira-finishedart.jpg?1689078696',
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
