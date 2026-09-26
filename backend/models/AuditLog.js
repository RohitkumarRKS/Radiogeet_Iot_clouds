const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  entityName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  actionType: {
    type: DataTypes.ENUM('ADDED', 'UPDATED', 'DELETED', 'LOGIN', 'LOGOUT', 'CREDENTIALS_UPDATED', 'ASSIGNED', 'UNASSIGNED'),
    allowNull: false,
  },
  actionStatus: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE'),
    defaultValue: 'SUCCESS',
  },
  actionData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = AuditLog;
