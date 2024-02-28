'use strict';

const { Model, Validator } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.belongsTo(models.Group,{
        foreignKey:'organizerId'
      })
      User.belongsToMany(models.Group,{
        through:models.Membership,
        otherKey:'groupId',
        foreignKey:'userId'
      })
      User.belongsToMany(models.Event,{
        through:models.Attendance,
        otherKey:'eventId',
        foreignKey:'userId'
      })
    }
  };

  User.init(
    {
      firstName:{
        type: DataTypes.STRING,
        allowNull:false
      },
      lastName:{
        type: DataTypes.STRING,
        allowNull:false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error("Cannot be an email.");
            }
          }
        }
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60]
        }
      }
    }, {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ["hashedPassword", "email", "createdAt", "updatedAt"]
        }
      }
    });
  return User;
};