const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alarm = sequelize.define('Alarm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  originatorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  originatorType: {
    type: DataTypes.ENUM('DEVICE', 'ASSET'),
    defaultValue: 'DEVICE',
  },
  originatorName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('CRITICAL', 'MAJOR', 'MINOR', 'WARNING', 'INDETERMINATE'),
    defaultValue: 'MAJOR',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE_UNACK', 'ACTIVE_ACK', 'CLEARED_UNACK', 'CLEARED_ACK'),
    defaultValue: 'ACTIVE_UNACK',
  },
  detail: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  startTs: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endTs: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ackTs: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  clearTs: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Alarm;
