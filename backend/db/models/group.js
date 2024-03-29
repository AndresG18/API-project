'use strict';
const { Model, Validator } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // define association here
      Group.belongsTo(models.User,{
        foreignKey:'organizerId',
        as:'Owner'
      })
      Group.hasMany(models.GroupImage,{
        foreignKey:'groupId'
      })
      Group.hasMany(models.Event,{
        foreignKey:'groupId'
      })
      Group.belongsToMany(models.User,{
        through:models.Membership,
        otherKey:'userId',
        foreignKey:'groupId',
        as:'Member'
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
      allowNull:false
    },
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};