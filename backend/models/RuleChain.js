const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RuleChain = sequelize.define('RuleChain', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  isRoot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDebug: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  configuration: {
    type: DataTypes.JSON,
    defaultValue: {
      nodes: [],
      connections: [],
    },
  },
});

module.exports = RuleChain;
