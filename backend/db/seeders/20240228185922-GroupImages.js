'use strict';
const { Op } = require('sequelize')
const { GroupImage } = require('../models')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const images = [
  {
    groupId:1,
    url:'image1.url',
    preview:true,
  },{
    groupId:2,
    url:'image2.url',
    preview:true,
  },{
    groupId:3,
    url:'image3.url',
    preview:true,
  },{
    groupId:3,
    url:'image4.url',
    preview:true
  },{
    groupId:2,
    url:'image.url5',
    preview:true,
  }

]
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await GroupImage.bulkCreate(images,{validate:true})
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'GroupImages'
    await queryInterface.bulkDelete(options,{
      groupId:{
        [Op.in]:[1,2,3]
      }
    })
  }
};
