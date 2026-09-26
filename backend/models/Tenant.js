const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('Tenant', {
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
  plan: {
    type: DataTypes.ENUM('FREE', 'STARTER', 'PRO', 'ENTERPRISE'),
    defaultValue: 'FREE',
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  allowedSidebarItems: {
    type: DataTypes.JSON,
    defaultValue: null,
    comment: 'Array of sidebar item paths enabled for this tenant. null = all allowed.',
  },
});

module.exports = Tenant;
