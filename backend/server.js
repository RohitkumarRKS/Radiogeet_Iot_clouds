require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { sequelize } = require('./models');
const setupWebSocket = require('./websocket/wsServer');
const errorHandler = require('./middleware/errorHandler');
const sanitizeInput = require('./middleware/sanitize');
const loginProtection = require('./middleware/loginProtection');

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
const gatewayRoutes = require('./routes/gateways');

const app = express();
const PORT = process.env.PORT || 2004;

// ─── Security Middleware ─────────────────────────────────────────────

// Helmet: Set secure HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for SPA compatibility
  crossOriginEmbedderPolicy: false,
}));

// Global API Rate Limiter: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
});

// Strict Login Rate Limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

// Telemetry Endpoint Rate Limiter: 1000 requests per minute per IP
const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Telemetry rate limit exceeded. Please reduce data frequency.' },
});

// CORS Configuration (Hardened for Production)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:2004', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error('CORS: Origin not allowed'), false);
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input Sanitization: Strip XSS from all request body strings
app.use(sanitizeInput);

// Serve static frontend dist in production if available
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// ─── Rate Limiters on Sensitive Routes ───────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter, loginProtection);
app.use('/api/telemetry/v1/', telemetryLimiter);
app.use('/api/v1/', telemetryLimiter);

// API Routes
app.all('/api/v1/:accessToken/telemetry', require('./controllers/telemetryController').pushByAccessToken);
app.all('/api/telemetry/v1/:accessToken/telemetry', require('./controllers/telemetryController').pushByAccessToken);
app.all('/api/v1/:accessToken/gateway/telemetry', require('./controllers/telemetryController').pushGatewayTelemetry);
app.all('/api/v1/gateway/telemetry', require('./controllers/telemetryController').pushGatewayTelemetry);
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
app.use('/api/gateways', gatewayRoutes);

// ─── Health Check Endpoint (/api/health) ─────────────────────────────
app.get('/api/health', async (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    version: require('./package.json').version || '1.0.0',
    node: process.version,
    memory: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    services: {},
  };

  // Check database connectivity
  try {
    await sequelize.authenticate();
    healthData.services.database = { status: 'UP', type: sequelize.getDialect() };
  } catch (e) {
    healthData.services.database = { status: 'DOWN', error: e.message };
    healthData.status = 'DEGRADED';
  }

  // Check MQTT server
  try {
    const mqttServer = require('./services/mqttServer');
    healthData.services.mqtt = { status: 'UP', port: process.env.MQTT_PORT || 1883 };
  } catch (e) {
    healthData.services.mqtt = { status: 'UNKNOWN' };
  }

  // Check WebSocket
  healthData.services.websocket = { status: 'UP', path: '/api/ws' };

  const httpStatus = healthData.status === 'UP' ? 200 : 503;
  res.status(httpStatus).json(healthData);
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

      // Start Telemetry Retention Auto-Purge Service
      const { startRetentionPurgeService } = require('./services/retentionPurgeService');
      startRetentionPurgeService();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
 
