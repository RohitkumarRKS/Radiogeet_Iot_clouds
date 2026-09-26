const { Setting, Tenant } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Helper to guarantee a valid tenantId (e.g. for SYS_ADMIN or unassigned users)
async function resolveTenantId(reqTenantId) {
  try {
    if (reqTenantId) {
      const existing = await Tenant.findByPk(reqTenantId);
      if (existing) return existing.id;
    }
    const firstTenant = await Tenant.findOne();
    if (firstTenant) return firstTenant.id;

    const [defaultTenant] = await Tenant.findOrCreate({
      where: { name: 'Demo Organization' },
      defaults: { id: uuidv4(), name: 'Demo Organization', plan: 'PRO' },
    });
    return defaultTenant.id;
  } catch (err) {
    return null;
  }
}

// Default settings for new tenants (matches ThingsBoard Cloud structure)
const defaultSettings = {
  general: {
    baseUrl: 'https://thingsboard.cloud',
    telemetryRetentionDays: 30,
    auditLogRetentionDays: 90,
    maxPayloadKb: 512,
    defaultLanguage: 'en_US',
    defaultTimezone: 'UTC',
  },
  mail: {
    protocol: 'smtp',
    host: 'smtp.sendgrid.net',
    port: 587,
    username: 'apikey',
    password: '',
    enableTls: true,
    enableProxy: false,
    defaultFrom: 'noreply@cloudboard.io',
    senderName: 'CloudBoard IoT Admin',
    connectionTimeout: 10000,
    smtpTimeout: 10000,
  },
  security: {
    passwordMinLength: 6,
    passwordMaxLength: 72,
    requireUppercase: true,
    requireDigits: false,
    requireSpecialChar: false,
    passwordExpirationDays: 0,
    maxFailedLogins: 5,
    lockoutDurationMinutes: 15,
    enable2FA: false,
    sessionTimeoutMinutes: 120,
    allowedCorsOrigins: '',
  },
  whiteLabeling: {
    appTitle: 'ThingsBoard Cloud',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#305680',
    headerBgColor: '#0b132b',
    domainName: '',
    copyrightText: '© 2026 CloudBoard IoT Platform',
    customCss: '',
    showNameVersion: true,
    enableHelpLinks: true,
    platformName: 'ThingsBoard',
    platformVersion: '3.7.1PE',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    slackEnabled: false,
    slackWebhookUrl: '',
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    alertTriggers: ['CRITICAL_ALARM', 'DEVICE_DISCONNECTED', 'HIGH_CPU'],
    matrix: {},
  },
  billing: {
    currentPlan: 'Free',
    priceMonthly: 0,
    billingCycle: 'Monthly',
    paymentMethod: '',
    billingEmail: '',
    usage: {
      devicesCount: 0,
      maxDevices: 30,
      telemetryPointsToday: 0,
      maxTelemetryDaily: 100000,
      activeDashboards: 0,
      maxDashboards: 10,
      activeRuleChains: 0,
      maxRuleChains: 5,
      apiCallsToday: 0,
      maxApiCallsDaily: 50000,
      dataPointsStored: 0,
      maxDataPointsStored: 10000000,
    },
    invoices: [
      { id: 'INV-2026-009', date: '2026-09-01', amount: '$0.00', status: 'Free Tier', downloadUrl: '#' },
    ],
  },
};

// Get or create settings for a tenant
async function getOrCreateSettings(rawTenantId) {
  const tenantId = await resolveTenantId(rawTenantId);
  const allSettings = {};
  for (const category of Object.keys(defaultSettings)) {
    let setting = await Setting.findOne({ where: { tenantId, category } });
    if (!setting) {
      try {
        setting = await Setting.create({
          tenantId,
          category,
          data: defaultSettings[category],
        });
      } catch (err) {
        setting = await Setting.findOne({ where: { tenantId, category } });
      }
    }
    allSettings[category] = setting ? setting.data : defaultSettings[category];
  }
  return allSettings;
}

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings(req.user?.tenantId);
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const tenantId = await resolveTenantId(req.user?.tenantId);

    if (!defaultSettings[category]) {
      return res.status(404).json({ message: `Settings category '${category}' not found.` });
    }

    let setting = await Setting.findOne({ where: { tenantId, category } });
    if (!setting) {
      setting = await Setting.create({
        tenantId,
        category,
        data: { ...defaultSettings[category], ...req.body },
      });
    } else {
      setting.data = { ...setting.data, ...req.body };
      setting.changed('data', true);
      await setting.save();
    }

    res.json({
      success: true,
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`,
      categoryData: setting.data,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendTestEmail = async (req, res, next) => {
  try {
    const { recipientEmail } = req.body;
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const tenantId = await resolveTenantId(req.user?.tenantId);
    const setting = await Setting.findOne({ where: { tenantId, category: 'mail' } });
    const mailConfig = setting?.data || defaultSettings.mail;

    // Simulate sending test email (in production, use nodemailer)
    setTimeout(() => {
      res.json({
        success: true,
        message: `Test email sent successfully to ${recipientEmail} via SMTP host ${mailConfig.host}:${mailConfig.port}`,
      });
    }, 800);
  } catch (error) {
    next(error);
  }
};

exports.upgradePlan = async (req, res, next) => {
  try {
    const { newPlan, billingCycle } = req.body;
    const tenantId = await resolveTenantId(req.user?.tenantId);

    let setting = await Setting.findOne({ where: { tenantId, category: 'billing' } });
    if (!setting) {
      setting = await Setting.create({
        tenantId,
        category: 'billing',
        data: { ...defaultSettings.billing },
      });
    }

    const planLimits = {
      'Free': { price: 0, maxDevices: 30, maxDashboards: 10, maxRuleChains: 5, maxApiCallsDaily: 50000, maxTelemetryDaily: 100000 },
      'Maker': { price: 10, maxDevices: 100, maxDashboards: 50, maxRuleChains: 20, maxApiCallsDaily: 500000, maxTelemetryDaily: 1000000 },
      'Prototype': { price: 25, maxDevices: 200, maxDashboards: 100, maxRuleChains: 50, maxApiCallsDaily: 1000000, maxTelemetryDaily: 5000000 },
      'Startup': { price: 99, maxDevices: 500, maxDashboards: 250, maxRuleChains: 100, maxApiCallsDaily: 5000000, maxTelemetryDaily: 10000000 },
      'Business': { price: 249, maxDevices: 1000, maxDashboards: 500, maxRuleChains: 200, maxApiCallsDaily: 10000000, maxTelemetryDaily: 50000000 },
      'Enterprise Cloud': { price: 499, maxDevices: 10000, maxDashboards: 1000, maxRuleChains: 500, maxApiCallsDaily: 50000000, maxTelemetryDaily: 100000000 },
    };

    const planName = newPlan || 'Maker';
    const limits = planLimits[planName] || planLimits['Maker'];

    setting.data = {
      ...setting.data,
      currentPlan: planName,
      priceMonthly: limits.price,
      billingCycle: billingCycle || 'Monthly',
      usage: {
        ...setting.data.usage,
        maxDevices: limits.maxDevices,
        maxDashboards: limits.maxDashboards,
        maxRuleChains: limits.maxRuleChains,
        maxApiCallsDaily: limits.maxApiCallsDaily,
        maxTelemetryDaily: limits.maxTelemetryDaily,
      },
    };
    setting.changed('data', true);
    await setting.save();

    res.json({
      success: true,
      message: `Plan upgraded successfully to ${planName}`,
      billing: setting.data,
    });
  } catch (error) {
    next(error);
  }
};
