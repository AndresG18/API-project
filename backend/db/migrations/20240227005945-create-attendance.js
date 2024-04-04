'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model:'Events',
          key:'id'
        },
        onDelete:'CASCADE',
        allowNull:false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model:'Users',
          key:'id'
        },
        onDelete:'CASCADE',
        allowNull:false
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull:false,
        defaultValue:'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Attendances'
    await queryInterface.dropTable(options);
  }
};