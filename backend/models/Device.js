const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'default',
  },
  label: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deviceProfileId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isGateway: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  accessToken: {
    type: DataTypes.STRING,
    defaultValue: () => uuidv4().replace(/-/g, '').substring(0, 20),
    unique: true,
  },
  lastActivityTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = Device;
