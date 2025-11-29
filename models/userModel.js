const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPremiumUser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalExpenses: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;