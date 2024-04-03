'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    static associate(models) {
      // define association here
      Venue.hasMany(models.Event,{
        foreignKey:'venueId',
      })
      Venue.belongsTo(models.Group,{
        foreignKey:'groupId',
      })
    }
  }
  Venue.init({
    groupId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: {
      type:DataTypes.STRING,
      validate:{
        isAlpha:true
      }
    },
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};