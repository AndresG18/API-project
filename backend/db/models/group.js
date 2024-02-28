'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // define association here
      Group.hasOne(models.User,{
        foreignKey:'organizerId'
      })
      Group.belongsTo(models.GroupImages,{
        foreignKey:'groupId'
      })
      Group.belongsToMany(models.Venue,{
        through:'Event',
        otherKey:'venueId',
        foreignKey:'groupId'
      })
      Group.belongsToMany(models.User,{
        through:'Membership',
        otherKey:'userId',
        foreignKey:'groupId'
      })
    }
  }
  Group.init({
    organizerId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    name: {
      type:DataTypes.STRING,
      allowNull:false
    },
    about: {
      type:DataTypes.TEXT,
      allowNull:false
    },
    type: {
      type: DataTypes.STRING,
      allowNull:false
    },
    private: {
      type:DataTypes.BOOLEAN,
      allowNull:false}
      ,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};