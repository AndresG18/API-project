'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {

    static associate(models) {
      // define association here
      Event.hasMany(models.EventImage,{
        foreignKey:'eventId'
      })
      Event.belongsToMany(models.User,{
        through:models.Attendance,
        otherKey:'userId',
        foreignKey:'eventId'
      })

      Event.belongsTo(models.Venue,{
        foreignKey:'venueId'
      })
      Event.belongsTo(models.Group,{
        foreignKey:'groupId'
      })
    }
  }
  Event.init({
    // id: {
    //   allowNull: false,
    //   autoIncrement: true,
    //   primaryKey: true,
    //   type: DataTypes.INTEGER
    // },
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