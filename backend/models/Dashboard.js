const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dashboard = sequelize.define('Dashboard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  configuration: {
    type: DataTypes.JSON,
    defaultValue: {
      widgets: [],
      gridSettings: {
        columns: 24,
        margin: 10,
      },
    },
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assignedCustomers: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Dashboard;
