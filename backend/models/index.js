const sequelize = require('../config/database');
const User = require('./User');
const Tenant = require('./Tenant');
const Device = require('./Device');
const DeviceProfile = require('./DeviceProfile');
const Asset = require('./Asset');
const Telemetry = require('./Telemetry');
const Alarm = require('./Alarm');
const Dashboard = require('./Dashboard');
const RuleChain = require('./RuleChain');
const Customer = require('./Customer');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const EntityView = require('./EntityView');
const OtaPackage = require('./OtaPackage');
const Integration = require('./Integration');
const Setting = require('./Setting');

// Associations
Tenant.hasMany(User, { foreignKey: 'tenantId' });
User.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Device, { foreignKey: 'tenantId' });
Device.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Asset, { foreignKey: 'tenantId' });
Asset.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(DeviceProfile, { foreignKey: 'tenantId' });
DeviceProfile.belongsTo(Tenant, { foreignKey: 'tenantId' });

DeviceProfile.hasMany(Device, { foreignKey: 'deviceProfileId' });
Device.belongsTo(DeviceProfile, { foreignKey: 'deviceProfileId' });

Tenant.hasMany(Dashboard, { foreignKey: 'tenantId' });
Dashboard.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(RuleChain, { foreignKey: 'tenantId' });
RuleChain.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Customer, { foreignKey: 'tenantId' });
Customer.belongsTo(Tenant, { foreignKey: 'tenantId' });

Customer.hasMany(Device, { foreignKey: 'customerId' });
Device.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(Asset, { foreignKey: 'customerId' });
Asset.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(User, { foreignKey: 'customerId' });
User.belongsTo(Customer, { foreignKey: 'customerId' });

Tenant.hasMany(Alarm, { foreignKey: 'tenantId' });
Alarm.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Notification, { foreignKey: 'tenantId' });
Notification.belongsTo(Tenant, { foreignKey: 'tenantId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Tenant.hasMany(AuditLog, { foreignKey: 'tenantId' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(EntityView, { foreignKey: 'tenantId' });
EntityView.belongsTo(Tenant, { foreignKey: 'tenantId' });

Customer.hasMany(EntityView, { foreignKey: 'customerId' });
EntityView.belongsTo(Customer, { foreignKey: 'customerId' });

Tenant.hasMany(OtaPackage, { foreignKey: 'tenantId' });
OtaPackage.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Integration, { foreignKey: 'tenantId' });
Integration.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Setting, { foreignKey: 'tenantId' });
Setting.belongsTo(Tenant, { foreignKey: 'tenantId' });

module.exports = {
  sequelize,
  User,
  Tenant,
  Device,
  DeviceProfile,
  Asset,
  Telemetry,
  Alarm,
  Dashboard,
  RuleChain,
  Customer,
  Notification,
  AuditLog,
  EntityView,
  OtaPackage,
  Integration,
  Setting,
};

