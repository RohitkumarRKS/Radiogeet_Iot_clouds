const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceProfile = sequelize.define('DeviceProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('DEFAULT', 'SENSOR', 'GATEWAY'),
    defaultValue: 'DEFAULT',
  },
  transportType: {
    type: DataTypes.ENUM('MQTT', 'HTTP', 'COAP', 'LWM2M'),
    defaultValue: 'MQTT',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  alarmRules: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = DeviceProfile;
