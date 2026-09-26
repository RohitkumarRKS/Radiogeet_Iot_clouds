const { v4: uuidv4 } = require('uuid');

async function seed() {
  const { User, Tenant, Device, DeviceProfile, Asset, Telemetry, Alarm, Dashboard, RuleChain, Customer, Notification, AuditLog } = require('../models');

  // ============ SYSTEM ADMIN SETUP ============
  // Create system administration tenant
  const [sysTenant] = await Tenant.findOrCreate({
    where: { name: 'System Administration' },
    defaults: {
      id: uuidv4(),
      name: 'System Administration',
      description: 'Platform administration tenant',
      plan: 'ENTERPRISE',
    }
  });

  // Create Super Admin user (password: sysadmin)
  const [sysAdmin] = await User.findOrCreate({
    where: { email: 'sysadmin@radiogeet.com' },
    defaults: {
      id: uuidv4(),
      email: 'sysadmin@radiogeet.com',
      password: 'sysadmin',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SYS_ADMIN',
      tenantId: sysTenant.id,
    }
  });

  // Create Super Admin user Admin@#2002 (password: Radiogeet@#2002)
  const [sysAdmin2002] = await User.findOrCreate({
    where: { email: 'Admin@#2002' },
    defaults: {
      id: uuidv4(),
      email: 'Admin@#2002',
      password: 'Radiogeet@#2002',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SYS_ADMIN',
      tenantId: sysTenant.id,
    }
  });

  console.log('🔐 Super Admin created: sysadmin@radiogeet.com / sysadmin and Admin@#2002 / Radiogeet@#2002');

  // ============ DEMO TENANT SETUP ============
  // Create demo tenant
  const [tenant] = await Tenant.findOrCreate({
    where: { name: 'Demo Organization' },
    defaults: {
      id: uuidv4(),
      name: 'Demo Organization',
      description: 'Demo tenant for CloudBoard IoT Platform',
      plan: 'PRO',
    }
  });

  // Create admin user (password: demo1234)
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@cloudboard.io' },
    defaults: {
      id: uuidv4(),
      email: 'admin@cloudboard.io',
      password: 'demo1234',
      firstName: 'Admin',
      lastName: 'User',
      role: 'TENANT_ADMIN',
      tenantId: tenant.id,
    }
  });

  // Create customers
  const customers = await Customer.bulkCreate([
    { id: uuidv4(), tenantId: tenant.id, name: 'Acme Corp', email: 'contact@acme.com', phone: '+1-555-0101', country: 'USA', city: 'New York' },
    { id: uuidv4(), tenantId: tenant.id, name: 'TechVille Industries', email: 'info@techville.com', phone: '+1-555-0202', country: 'Germany', city: 'Berlin' },
    { id: uuidv4(), tenantId: tenant.id, name: 'GreenField Solutions', email: 'hello@greenfield.io', phone: '+44-20-7946-0958', country: 'UK', city: 'London' },
  ]);

  // Default profiles setup
  const profiles = await DeviceProfile.bulkCreate([
    { id: uuidv4(), tenantId: tenant.id, name: 'Temperature Sensor', description: 'Measures ambient temperature', type: 'SENSOR', transportType: 'MQTT', isDefault: true },
    { id: uuidv4(), tenantId: tenant.id, name: 'Humidity Sensor', description: 'Measures humidity levels', type: 'SENSOR', transportType: 'MQTT' },
    { id: uuidv4(), tenantId: tenant.id, name: 'Smart Gateway', description: 'IoT gateway for connecting multiple sensors', type: 'GATEWAY', transportType: 'MQTT' },
    { id: uuidv4(), tenantId: tenant.id, name: 'Energy Meter', description: 'Measures power consumption', type: 'SENSOR', transportType: 'HTTP' },
    { id: uuidv4(), tenantId: tenant.id, name: 'Air Quality Sensor', description: 'Monitors AQI and pollutants', type: 'SENSOR', transportType: 'MQTT' },
  ]);

  // Default devices setup
  const devices = await Device.bulkCreate([
    {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Thermostat A1',
      type: 'thermostat',
      label: 'Server Room Thermostat',
      deviceProfileId: profiles[0].id,
      isActive: true,
      accessToken: 'A1_TEST_TOKEN',
      additionalInfo: { isSimulated: false, location: 'Server Room 101' },
    },
    {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Environmental Sensor ES-01',
      type: 'air_quality',
      label: 'Office Air Quality Sensor',
      deviceProfileId: profiles[4].id,
      isActive: true,
      accessToken: 'ES01_TEST_TOKEN',
      additionalInfo: { isSimulated: false, location: 'Main Office' },
    },
    {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'MQTT Test Device',
      type: 'default',
      label: 'Dedicated MQTT Test Device',
      deviceProfileId: profiles[0].id,
      isActive: true,
      accessToken: 'mqtt_test_token_123',
      additionalInfo: { isSimulated: false, location: 'Test Lab' },
    },
  ]);


  // Create rule chains
  await RuleChain.bulkCreate([
    {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Root Rule Chain',
      description: 'Main processing pipeline for all incoming messages',
      isRoot: true,
      configuration: {
        nodes: [
          { id: 'n1', type: 'input', name: 'Input', x: 100, y: 200, config: {} },
          { id: 'n2', type: 'filter', name: 'Message Type Filter', x: 350, y: 150, config: { messageTypes: ['POST_TELEMETRY_REQUEST'] } },
          { id: 'n3', type: 'filter', name: 'Temperature Check', x: 600, y: 100, config: { script: 'return msg.temperature > 30;' } },
          { id: 'n4', type: 'action', name: 'Create Alarm', x: 850, y: 50, config: { alarmType: 'High Temperature', severity: 'CRITICAL' } },
          { id: 'n5', type: 'action', name: 'Save Telemetry', x: 600, y: 250, config: {} },
          { id: 'n6', type: 'external', name: 'Send Email', x: 1100, y: 50, config: { to: 'admin@cloudboard.io', subject: 'Temperature Alert' } },
        ],
        connections: [
          { from: 'n1', to: 'n2', label: 'Post Telemetry' },
          { from: 'n2', to: 'n3', label: 'True' },
          { from: 'n2', to: 'n5', label: 'False' },
          { from: 'n3', to: 'n4', label: 'True' },
          { from: 'n3', to: 'n5', label: 'False' },
          { from: 'n4', to: 'n6', label: 'Created' },
        ],
      },
    },
    {
      id: uuidv4(),
      tenantId: tenant.id,
      name: 'Device Lifecycle',
      description: 'Handles device connect/disconnect events',
      isRoot: false,
      configuration: {
        nodes: [
          { id: 'n1', type: 'input', name: 'Input', x: 100, y: 200, config: {} },
          { id: 'n2', type: 'filter', name: 'Event Filter', x: 350, y: 200, config: { events: ['CONNECT', 'DISCONNECT'] } },
          { id: 'n3', type: 'action', name: 'Update Attributes', x: 600, y: 200, config: {} },
        ],
        connections: [
          { from: 'n1', to: 'n2', label: '' },
          { from: 'n2', to: 'n3', label: 'True' },
        ],
      },
    },
  ]);

  // Create notifications
  await Notification.bulkCreate([
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, type: 'ALARM', subject: 'Critical: High Temperature Alert', message: 'Thermostat A1 temperature exceeded 30°C threshold. Current value: 32.5°C', status: 'UNREAD' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, type: 'ALARM', subject: 'Major: Humidity Alert', message: 'Humidity Monitor H1 reporting 84.2% humidity in server room', status: 'UNREAD' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, type: 'SYSTEM', subject: 'Welcome to CloudBoard', message: 'Your IoT platform is set up and ready to use. Start by exploring your devices and dashboards.', status: 'UNREAD' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, type: 'ENTITY_ACTION', subject: 'New Device Added', message: 'A new device "Pressure Sensor PS-01" has been provisioned and is online.', status: 'READ' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, type: 'RULE_ENGINE', subject: 'Rule Chain Updated', message: 'Root Rule Chain has been modified. All incoming messages will be processed using the updated configuration.', status: 'READ' },
  ]);

  // Create audit logs
  await AuditLog.bulkCreate([
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, userName: 'Admin User', entityType: 'DEVICE', entityName: 'Thermostat A1', actionType: 'ADDED', actionStatus: 'SUCCESS' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, userName: 'Admin User', entityType: 'DASHBOARD', entityName: 'Overview Dashboard', actionType: 'ADDED', actionStatus: 'SUCCESS' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, userName: 'Admin User', entityType: 'RULE_CHAIN', entityName: 'Root Rule Chain', actionType: 'UPDATED', actionStatus: 'SUCCESS' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, userName: 'Admin User', entityType: 'CUSTOMER', entityName: 'Acme Corp', actionType: 'ADDED', actionStatus: 'SUCCESS' },
    { id: uuidv4(), tenantId: tenant.id, userId: admin.id, userName: 'Admin User', entityType: 'USER', entityName: 'admin@cloudboard.io', actionType: 'LOGIN', actionStatus: 'SUCCESS' },
  ]);

  console.log('✅ Seed complete: Admin users, tenant setup, and default profiles created.');
}

if (require.main === module) {
  const { sequelize } = require('../models');
  sequelize.sync({ force: true }).then(() => {
    return seed();
  }).then(() => {
    console.log('Database synced & seeded successfully.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seed;

