const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  paymentid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orderid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;