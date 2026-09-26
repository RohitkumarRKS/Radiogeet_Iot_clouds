const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EntityView = sequelize.define('EntityView', {
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
  entityType: {
    type: DataTypes.STRING, // DEVICE or ASSET
    defaultValue: 'DEVICE',
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  keys: {
    type: DataTypes.JSON, // timeseries and attribute keys allowed
    defaultValue: [],
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = EntityView;
