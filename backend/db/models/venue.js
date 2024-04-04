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
    address: {
      type:DataTypes.STRING,
      allowNull:false
    },
    city: {
      type:DataTypes.STRING,
      allowNull:false
    },
    state: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        isAlpha:true
      }
    },
    lat: {
      type:DataTypes.DECIMAL,
      validate:{
        min:-90,
        max:90
      }
    },
    lng: {
      type:DataTypes.DECIMAL,
      validate:{
        min:-90,
        max:90
      }
    }
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};