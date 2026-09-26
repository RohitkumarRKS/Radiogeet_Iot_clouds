require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize } = require('./models');
const setupWebSocket = require('./websocket/wsServer');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const assetRoutes = require('./routes/assets');
const telemetryRoutes = require('./routes/telemetry');
const alarmRoutes = require('./routes/alarms');
const dashboardRoutes = require('./routes/dashboards');
const ruleChainRoutes = require('./routes/ruleChains');
const customerRoutes = require('./routes/customers');
const notificationRoutes = require('./routes/notifications');
const auditLogRoutes = require('./routes/auditLogs');
const entityViewRoutes = require('./routes/entityViews');
const otaPackageRoutes = require('./routes/otaPackages');
const integrationRoutes = require('./routes/integrations');
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 2004;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:2004', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow requests in deployment
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend dist in production if available
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// API Routes
app.all('/api/v1/:accessToken/telemetry', require('./controllers/telemetryController').pushByAccessToken);
app.all('/api/telemetry/v1/:accessToken/telemetry', require('./controllers/telemetryController').pushByAccessToken);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/rule-chains', ruleChainRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/entity-views', entityViewRoutes);
app.use('/api/ota-packages', otaPackageRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback for frontend dist in production
if (fs.existsSync(frontendDist)) {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Stats endpoint for home dashboard
app.get('/api/stats', require('./middleware/auth').optionalAuth, async (req, res, next) => {
  try {
    const { Device, Asset, Alarm, Dashboard, Customer, RuleChain } = require('./models');
    const { Op } = require('sequelize');
    const tenantId = req.user.tenantId;

    const [deviceCount, activeDevices, assetCount, activeAlarms, dashboardCount, customerCount, ruleChainCount] = await Promise.all([
      Device.count({ where: { tenantId } }),
      Device.count({ where: { tenantId, isActive: true } }),
      Asset.count({ where: { tenantId } }),
      Alarm.count({ where: { tenantId, status: { [Op.in]: ['ACTIVE_UNACK', 'ACTIVE_ACK'] } } }),
      Dashboard.count({ where: { tenantId } }),
      Customer.count({ where: { tenantId } }),
      RuleChain.count({ where: { tenantId } }),
    ]);

    res.json({
      devices: { total: deviceCount, active: activeDevices, inactive: deviceCount - activeDevices },
      assets: { total: assetCount },
      alarms: { active: activeAlarms },
      dashboards: { total: dashboardCount },
      customers: { total: customerCount },
      ruleChains: { total: ruleChainCount },
    });
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
setupWebSocket(server, app);

// Initialize database and start server
async function start() {
  try {
    // Disable foreign key checks for SQLite to allow clean drops
    try {
      await sequelize.query('PRAGMA foreign_keys = OFF;');
    } catch (e) { /* not SQLite or pragma not supported */ }

    // Drop leftover temp backup tables from SQLite if any exist
    try {
      await sequelize.query('DROP TABLE IF EXISTS `Tenants_backup`;');
      await sequelize.query('DROP TABLE IF EXISTS `Users_backup`;');
      await sequelize.query('DROP TABLE IF EXISTS `AuditLogs_backup`;');
    } catch (e) { /* ignore cleanup errors */ }

    const forceSync = process.env.FORCE_SYNC === 'true' || process.env.RESET_DB === 'true';
    
    let synced = false;
    if (!forceSync) {
      try {
        await sequelize.sync();
        synced = true;
      } catch (syncErr) {
        console.warn('Standard sync note:', syncErr.message);
      }
    }

    if (!synced) {
      // Force sync: disable FK, drop all, recreate
      try { await sequelize.query('PRAGMA foreign_keys = OFF;'); } catch (e) {}
      await sequelize.sync({ force: true });
      try { await sequelize.query('PRAGMA foreign_keys = ON;'); } catch (e) {}
    }

    console.log('Database synced successfully.');

    // Re-enable foreign keys
    try {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    } catch (e) { /* not SQLite */ }

    // Run seeder if superadmin missing or table empty
    const { User } = require('./models');
    let superAdmin = null;
    try {
      superAdmin = await User.findOne({ where: { role: 'SYS_ADMIN' } });
    } catch (e) {
      // Table may not exist yet, force rebuild
      try { await sequelize.query('PRAGMA foreign_keys = OFF;'); } catch (e2) {}
      await sequelize.sync({ force: true });
      try { await sequelize.query('PRAGMA foreign_keys = ON;'); } catch (e2) {}
    }

    if (!superAdmin) {
      try {
        console.log('Seeding super admin & demo data...');
        const seed = require('./seeds/seed');
        await seed();
        console.log('Seed data created successfully.');
      } catch (seedErr) {
        console.warn('Initial seeding note:', seedErr.message);
      }
    }

    // Proactively free port 2004 if held by a stale process
    try {
      const { execSync } = require('child_process');
      if (process.platform === 'win32') {
        execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
      } else {
        execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' });
      }
    } catch (e) { /* port is free */ }

    // Handle port conflicts gracefully if any remain
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} occupied, clearing stale process...`);
        try {
          const { execSync } = require('child_process');
          if (process.platform === 'win32') {
            execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
          } else {
            execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' });
          }
        } catch (e) {}

        setTimeout(() => {
          server.listen(PORT);
        }, 1000);
      } else {
        console.error('Server error:', err);
      }
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 CloudBoard Server running on http://0.0.0.0:${PORT}`);
      console.log(`📡 WebSocket available at ws://0.0.0.0:${PORT}/api/ws`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health\n`);

      // Start live telemetry simulator for connected devices
      const { startTelemetrySimulator } = require('./services/telemetrySimulator');
      startTelemetrySimulator();

      // Start native MQTT Server on TCP Port 1883
      const { startMqttServer } = require('./services/mqttServer');
      startMqttServer();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
 
