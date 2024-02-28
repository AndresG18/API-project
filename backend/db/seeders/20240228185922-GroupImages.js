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
    url:'https://www.google.com/imgres?q=health%20images&imgurl=https%3A%2F%2Ffmcggurus.com%2Fwp-content%2Fuploads%2F2019%2F06%2Fapple-blue-background-close-up-1353366.jpg&imgrefurl=https%3A%2F%2Ffmcggurus.com%2Fblog%2Ffocusing-too-much-on-health%2F&docid=gvKc011pxvSEvM&tbnid=uyqS7qsqJ0akqM&vet=12ahUKEwjbjuid3c6EAxUgJUQIHbpODTEQM3oECB8QAA..i&w=3832&h=4000&hcb=2&ved=2ahUKEwjbjuid3c6EAxUgJUQIHbpODTEQM3oECB8QAA',
    preview:true,
  },{
    groupId:2,
    url:'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.womenshealthmag.com%2Fbeauty%2Fa19939846%2Fbest-results-from-skin-care-products%2F&psig=AOvVaw0xSyFZ7RbFY7Z4eO3zM6Yr&ust=1709233788299000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCJiT96fezoQDFQAAAAAdAAAAABAT',
    preview:true,
  },{
    groupId:3,
    url:'https://www.google.com/imgres?q=arcade%20animged&imgurl=https%3A%2F%2Fcdna.artstation.com%2Fp%2Fassets%2Fimages%2Fimages%2F064%2F920%2F110%2Flarge%2Flauan-s-pereira-finishedart.jpg%3F1689078696&imgrefurl=https%3A%2F%2Fwww.artstation.com%2Fartwork%2FXgNvm3&docid=73OaoJ5QwgIogM&tbnid=Nxzj7H_TecbT5M&vet=12ahUKEwjn57fo3s6EAxWSle4BHRMQB6wQM3oECHoQAA..i&w=1920&h=843&hcb=2&ved=2ahUKEwjn57fo3s6EAxWSle4BHRMQB6wQM3oECHoQAA',
    preview:true,
  },{
    groupId:3,
    url:'https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fimages%2Fpeople-playing-board-games-collection-of-hand-drawn-scenes-with-modern-tabletop-games-for-family-and-friends-vector-illustration-of-children-adventure-game-senior-hobby-and-leisure-activity%2F578408628&psig=AOvVaw2r5ly8rQvaaw6yLLFiphYr&ust=1709234100982000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCLC2mLHfzoQDFQAAAAAdAAAAABAE',
    preview:true
  },{
    groupId:2,
    url:'https://www.google.com/imgres?q=skin%20care%20animated&imgurl=https%3A%2F%2Fmedia.illustrationx.com%2Fmedia%2Fartist%2FJosephMcDermott%2F3484-133855.gif&imgrefurl=https%3A%2F%2Fwww.illustrationx.com%2Fartists%2FJosephMcDermott%2F133855&docid=QVrcJIw3PyovYM&tbnid=f6L9qzPxr4gfcM&vet=12ahUKEwiH3u2W3s6EAxUDIUQIHSFIDYcQM3oECGgQAA..i&w=1500&h=1000&hcb=2&ved=2ahUKEwiH3u2W3s6EAxUDIUQIHSFIDYcQM3oECGgQAA',
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
