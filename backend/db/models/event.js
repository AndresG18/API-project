'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.hasMany(models.EventImage,{
        foreignKey:'eventId'
      })
      Event.belongsToMany(models.User,{
        through:'Attendance',
        otherKey:'userId',
        foreignKey:'eventId'
      })
    }
  }
  Event.init({
    venueId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    name: {
      type:DataTypes.STRING,
      allowNull:false
  },
    description: DataTypes.TEXT,
    type: {
      type: DataTypes.STRING,
      allowNull:false
    },
    capacity: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    startDate:{ 
      type:DataTypes.DATE,
      allowNull:false
    },
    endDate:{
      type: DataTypes.DATE,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};