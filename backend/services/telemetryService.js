const db = require('../models');
const wsServer = require('../websocket/wsServer');

/**
 * Process incoming telemetry data — store, broadcast, and trigger alarm rules.
 */
async function processTelemetry(entityId, data, timestamp = Date.now()) {
  const records = [];

  for (const [key, value] of Object.entries(data)) {
    if (key === 'ts' || key === 'token' || key === 'accessToken') continue;
    const numericValue = parseFloat(value);
    const isNum = !isNaN(numericValue);
    const stringVal = typeof value === 'string' ? value : null;

    if (!isNum && stringVal === null) continue;

    records.push({
      entityId,
      entityType: 'DEVICE',
      key,
      value: isNum ? numericValue : 0,
      stringValue: stringVal,
      timestamp: new Date(timestamp),
    });
  }

  if (records.length === 0) return [];

  // Broadcast via WebSocket INSTANTLY (0ms delay for UI render)
  wsServer.broadcast(entityId, {
    type: 'TELEMETRY_UPDATE',
    entityId,
    data: records.map(r => ({ key: r.key, value: r.value, ts: r.timestamp })),
  });

  // Store in database
  const created = await db.Telemetry.bulkCreate(records);

  // Update device last activity
  await db.Device.update(
    { lastActivityTime: new Date(), isActive: true },
    { where: { id: entityId } }
  );

  // Evaluate alarm rules
  await evaluateAlarmRules(entityId, data);

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
