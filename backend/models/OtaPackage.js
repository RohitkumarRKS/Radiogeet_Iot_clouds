const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtaPackage = sequelize.define('OtaPackage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // FIRMWARE or SOFTWARE
    defaultValue: 'FIRMWARE',
  },
  deviceProfileId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  checksumAlgorithm: {
    type: DataTypes.STRING,
    defaultValue: 'SHA256',
  },
  checksum: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
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

module.exports = OtaPackage;
