const db = require('../models');

/**
 * Create or update an alarm for a given entity.
 */
async function createAlarm({ tenantId, originatorType, originatorId, originatorName, type, severity, detail }) {
  // Check for existing active alarm of same type
  const existing = await db.Alarm.findOne({
    where: {
      originatorId,
      type,
      status: ['ACTIVE_UNACK', 'ACTIVE_ACK'],
    },
  });

  if (existing) {
    // Update existing alarm detail
    existing.detail = { ...existing.detail, ...detail };
    await existing.save();
    return existing;
  }

  return db.Alarm.create({
    tenantId,
    originatorType,
    originatorId,
    originatorName,
    type,
    severity: severity || 'WARNING',
    status: 'ACTIVE_UNACK',
    detail: detail || {},
    startTs: new Date(),
  });
}

/**
 * Acknowledge an alarm.
 */
async function acknowledgeAlarm(alarmId) {
  const alarm = await db.Alarm.findByPk(alarmId);
  if (!alarm) throw new Error('Alarm not found');

  if (alarm.status === 'ACTIVE_UNACK') {
    alarm.status = 'ACTIVE_ACK';
  } else if (alarm.status === 'CLEARED_UNACK') {
    alarm.status = 'CLEARED_ACK';
  }
  alarm.ackTs = new Date();
  await alarm.save();
  return alarm;
}

/**
 * Clear an alarm.
 */
async function clearAlarm(alarmId) {
  const alarm = await db.Alarm.findByPk(alarmId);
  if (!alarm) throw new Error('Alarm not found');

  if (alarm.status === 'ACTIVE_UNACK') {
    alarm.status = 'CLEARED_UNACK';
  } else if (alarm.status === 'ACTIVE_ACK') {
    alarm.status = 'CLEARED_ACK';
  }
  alarm.endTs = new Date();
  await alarm.save();
  return alarm;
}

/**
 * Get alarm statistics.
 */
async function getAlarmStats(tenantId) {
  const { Op } = require('sequelize');

  const [active, acknowledged, total] = await Promise.all([
    db.Alarm.count({ where: { tenantId, status: { [Op.like]: 'ACTIVE%' } } }),
    db.Alarm.count({ where: { tenantId, status: 'ACTIVE_ACK' } }),
    db.Alarm.count({ where: { tenantId } }),
  ]);

  return { active, acknowledged, total, cleared: total - active };
}

module.exports = {
  createAlarm,
  acknowledgeAlarm,
  clearAlarm,
  getAlarmStats,
};
