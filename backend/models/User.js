const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  role: {
    type: DataTypes.ENUM('SYS_ADMIN', 'TENANT_ADMIN', 'CUSTOMER_USER'),
    defaultValue: 'TENANT_ADMIN',
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  additionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  assignedDashboards: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of dashboard IDs assigned to this customer user',
  },
  allowedSidebarItems: {
    type: DataTypes.JSON,
    defaultValue: null,
    comment: 'For CUSTOMER_USER: which sidebar items they can see. null = use tenant default',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  twoFASecret: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
    comment: 'TOTP secret for Google Authenticator / Authy 2FA',
  },
  twoFAEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether 2FA is active for this user',
  },
  twoFAVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether user has completed 2FA setup verification',
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.twoFASecret;
  return values;
};

module.exports = User;
