const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Telemetry = sequelize.define('Telemetry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.ENUM('DEVICE', 'ASSET'),
    defaultValue: 'DEVICE',
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stringValue: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  indexes: [
    { fields: ['entityId', 'key', 'timestamp'] },
    { fields: ['entityId', 'timestamp'] },
  ],
});

module.exports = Telemetry;
