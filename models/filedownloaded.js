const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const FileDownloaded = sequelize.define('FileDownloaded', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  filedownloadurl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'filedownloaded',
  timestamps: true,
});

module.exports = FileDownloaded;