'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");
const {Op} = require('sequelize')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        firstName: "Demo",
        lastName: "User",
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')
      }, {
        firstName: "Darth",
        lastName: "Cina",
        email: 'demo1@user.io',
        username: 'DarthCiina',
        hashedPassword: bcrypt.hashSync('password2')
      }, {
        firstName: "Andres",
        lastName: "Garcia",
        email: 'demo2@user.io',
        username: 'Andres',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });

  },

  async down(queryInterface, Sequelize) {
  options.tableName = 'Users'
    await queryInterface.bulkDelete(options,{
        username:{
        [Op.in] : ["Demo", 'Dulcina', 'Andres']
      }
    })
  }
};
