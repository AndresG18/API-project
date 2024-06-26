'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Membership.init({
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    status:{
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue:'pending',
      validate:{
        isIn:[['pending','member','co-host','host']]
      }
    }
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};