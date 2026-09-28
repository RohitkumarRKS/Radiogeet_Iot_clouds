const db = require('../models');
const wsServer = require('../websocket/wsServer');

/**
 * Process incoming telemetry data — store, broadcast, evaluate alarms, and execute rule engine.
 */
async function processTelemetry(entityId, data, timestamp = Date.now()) {
  if (!data) return [];
  const records = [];

  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const itemTs = item.ts ? new Date(item.ts).getTime() : timestamp;
    const kvSource = (item.values && typeof item.values === 'object' && !Array.isArray(item.values))
      ? item.values
      : item;

    for (const [key, value] of Object.entries(kvSource)) {
      if (key === 'ts' || key === 'token' || key === 'accessToken' || key === 'values') continue;
      
      let numericValue = 0;
      let stringVal = null;

      if (typeof value === 'boolean') {
        numericValue = value ? 1 : 0;
        stringVal = value ? 'true' : 'false';
      } else if (typeof value === 'number') {
        numericValue = isNaN(value) ? 0 : value;
        stringVal = String(value);
      } else if (typeof value === 'string') {
        const parsed = parseFloat(value);
        numericValue = !isNaN(parsed) ? parsed : 0;
        stringVal = value;
      } else if (typeof value === 'object' && value !== null) {
        numericValue = 0;
        stringVal = JSON.stringify(value);
      } else {
        continue;
      }

      records.push({
        entityId,
        entityType: 'DEVICE',
        key,
        value: numericValue,
        stringValue: stringVal,
        timestamp: new Date(itemTs),
      });
    }
  }

  if (records.length === 0) return [];

  // Broadcast via WebSocket INSTANTLY (0ms delay for UI render)
  wsServer.broadcast(entityId, {
    type: 'TELEMETRY_UPDATE',
    entityId,
    data: records.map(r => ({
      key: r.key,
      value: r.value,
      stringValue: r.stringValue,
      ts: r.timestamp
    })),
  });

  // Store in database
  const created = await db.Telemetry.bulkCreate(records);

  // Update device last activity & mark active
  const now = new Date();
  await db.Device.update(
    { lastActivityTime: now, isActive: true },
    { where: { id: entityId } }
  );

  // Broadcast active status to all open screens (DeviceList, Dashboard, etc.)
  if (typeof wsServer.broadcastAll === 'function') {
    wsServer.broadcastAll({
      type: 'DEVICE_STATUS_UPDATE',
      entityId,
      isActive: true,
      status: 'ONLINE',
      lastActivityTime: now.toISOString()
    });
  }

  // Evaluate preset alarm rules
  await evaluateAlarmRules(entityId, data);

  // Execute Rule Engine pipeline if root rule chain exists
  try {
    const { executeRuleChain } = require('./ruleEngineService');
    const device = await db.Device.findByPk(entityId, { attributes: ['tenantId'] });
    if (device && device.tenantId) {
      executeRuleChain(device.tenantId, entityId, data).catch(() => {});
    }
  } catch (reErr) {
    // Ignore rule engine non-fatal errors
  }

  return created;
}

/**
 * Evaluate alarm rules for a device based on incoming telemetry.
 */
async function evaluateAlarmRules(deviceId, telemetryData) {
  try {
    const device = await db.Device.findByPk(deviceId, {
      include: [{ model: db.DeviceProfile }],
    });

    if (!device || !device.DeviceProfile?.alarmRules) return;

    const rules = device.DeviceProfile.alarmRules;
    if (!Array.isArray(rules)) return;

    for (const rule of rules) {
      const value = telemetryData[rule.key];
      if (value === undefined) continue;

      const numValue = parseFloat(value);
      let triggered = false;

      switch (rule.condition) {
        case 'GREATER_THAN':
          triggered = numValue > rule.threshold;
          break;
        case 'LESS_THAN':
          triggered = numValue < rule.threshold;
          break;
        case 'EQUALS':
          triggered = numValue === rule.threshold;
          break;
        default:
          break;
      }

      if (triggered) {
        // Check if an active alarm of this type already exists
        const existing = await db.Alarm.findOne({
          where: {
            originatorId: deviceId,
            type: rule.alarmType || `${rule.key}_alarm`,
            status: ['ACTIVE_UNACK', 'ACTIVE_ACK'],
          },
        });

        if (!existing) {
          await db.Alarm.create({
            tenantId: device.tenantId,
            originatorType: 'DEVICE',
            originatorId: deviceId,
            originatorName: device.name,
            type: rule.alarmType || `${rule.key}_alarm`,
            severity: rule.severity || 'WARNING',
            status: 'ACTIVE_UNACK',
            detail: {
              message: `${rule.key} value ${numValue} ${rule.condition.toLowerCase().replace(/_/g, ' ')} ${rule.threshold}`,
              triggeredValue: numValue,
              threshold: rule.threshold,
            },
            startTs: new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.error('Alarm rule evaluation error:', err.message);
  }
}

/**
 * Get latest telemetry values for an entity.
 */
async function getLatestTelemetry(entityId, keys = []) {
  const where = { entityId };
  if (keys.length > 0) where.key = keys;

  const results = await db.Telemetry.findAll({
    where,
    attributes: ['key', 'value', 'timestamp'],
    order: [['timestamp', 'DESC']],
    group: ['key'],
  });

  return results.reduce((acc, r) => {
    acc[r.key] = { value: r.value, ts: r.timestamp };
    return acc;
  }, {});
}

/**
 * Get historical time-series telemetry.
 */
async function getTimeseries(entityId, { keys, startTs, endTs, limit = 500 }) {
  const { Op } = require('sequelize');
  const where = { entityId };

  if (keys && keys.length > 0) where.key = keys;
  if (startTs || endTs) {
    where.timestamp = {};
    if (startTs) where.timestamp[Op.gte] = new Date(parseInt(startTs));
    if (endTs) where.timestamp[Op.lte] = new Date(parseInt(endTs));
  }

  const data = await db.Telemetry.findAll({
    where,
    order: [['timestamp', 'ASC']],
    limit: parseInt(limit),
  });

  // Group by key
  const grouped = {};
  data.forEach(d => {
    if (!grouped[d.key]) grouped[d.key] = [];
    grouped[d.key].push({ value: d.value, ts: d.timestamp.getTime() });
  });

  return grouped;
}

module.exports = {
  processTelemetry,
  evaluateAlarmRules,
  getLatestTelemetry,
  getTimeseries,
};
