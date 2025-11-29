const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const ResetPassword = sequelize.define('ResetPassword', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'resetpasswords',
  timestamps: true,
});

module.exports = ResetPassword;