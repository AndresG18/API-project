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
    venueId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    groupId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    name: {
      type:DataTypes.STRING,
      allowNull:false
  },
    description: {
      type:DataTypes.TEXT,
      allowNull:false
  },
    type: {
      type: DataTypes.STRING,
      allowNull:false
    },
    capacity: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    price: DataTypes.DECIMAL,
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
    scopes:{
      exludingTimestamps:{
        attributes:{
          exclude:['createdAt','updatedAt']
        }
      }
    }
  });
  return Event;
};