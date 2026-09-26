const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. general, mail, security, whiteLabeling, notifications, billing',
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
}, {
  indexes: [
    { unique: true, fields: ['tenantId', 'category'] },
  ],
});

module.exports = Setting;
