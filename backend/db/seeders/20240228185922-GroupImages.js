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
    url:'https://fmcggurus.com/wp-content/uploads/2019/06/apple-blue-background-close-up-1353366.jpg',
    preview:true,
  },{
    groupId:2,
    url:'https://hips.hearstapps.com/hmg-prod/images/766/how-to-get-better-results-from-your-skin-care-products-1487267549.jpg?crop=0.636xw:1xh;center,top&resize=980:*',
    preview:true,
  },{
    groupId:3,
    url:"https://cdn-icons-png.freepik.com/256/1687/1687516.png?semt=ais_hybrid",
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
