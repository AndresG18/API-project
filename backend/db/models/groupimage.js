'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroupImage extends Model {
    static associate(models) {
      // define association here
      GroupImage.belongsTo(models.Group,{
        foreignKey:"groupId",
        as:'GroupImages'
      })
    }
  }
  GroupImage.init({
    groupId: DataTypes.INTEGER,
    url: DataTypes.TEXT,
    preview: {
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    }
  }, {
    sequelize,
    modelName: 'GroupImage',
  });
  return GroupImage;
};