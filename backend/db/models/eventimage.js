'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    static associate(models) {
      // define association here
      EventImage.belongsTo(models.Event,{
        foreignKey:"eventId"
      })
    }
  }
  EventImage.init({
    eventId: DataTypes.INTEGER,
    url: DataTypes.TEXT,
    preview: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    }
  }, {
    sequelize,
    modelName: 'EventImage',
  });
  return EventImage;
};