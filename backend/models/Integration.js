const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Integration = sequelize.define('Integration', {
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
    type: DataTypes.STRING, // MQTT, HTTP, KAFKA, COAP
    defaultValue: 'MQTT',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE',
  },
  configuration: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = Integration;
