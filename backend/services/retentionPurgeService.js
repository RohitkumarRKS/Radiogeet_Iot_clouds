/**
 * Telemetry Retention Auto-Purge Service
 * Periodically deletes historical telemetry data older than the configured retention threshold (telemetryRetentionDays).
 */
const { Op } = require('sequelize');
const { Telemetry, Setting, AuditLog } = require('../models');

// Default purge interval: 24 hours (in milliseconds)
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function purgeOldTelemetry() {
  try {
    // 1. Fetch configured retention days from system settings
    const settings = Setting ? await Setting.findOne() : null;
    const retentionDays = settings && settings.telemetryRetentionDays ? settings.telemetryRetentionDays : 30;

    if (retentionDays <= 0) {
      console.log('ℹ️ Telemetry retention purge disabled (telemetryRetentionDays set to 0 or unconfigured).');
      return;
    }

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    console.log(`🧹 Running Telemetry Auto-Purge: Deleting telemetry data older than ${retentionDays} days (before ${cutoffDate.toISOString()})...`);

    let purgedTelemetryCount = 0;

    // 3. Purge Telemetry records older than cutoffDate
    if (Telemetry) {
      purgedTelemetryCount = await Telemetry.destroy({
        where: {
          [Op.or]: [
            { timestamp: { [Op.lt]: cutoffDate } },
            { createdAt: { [Op.lt]: cutoffDate } },
          ],
        },
      });
    }

    const totalPurged = purgedTelemetryCount;
    console.log(`✅ Telemetry Auto-Purge Complete: Deleted ${totalPurged} old records (${purgedTelemetryCount} telemetry events).`);

    // 4. Log to AuditLog if records were purged
    if (totalPurged > 0 && AuditLog) {
      const { v4: uuidv4 } = require('uuid');
      await AuditLog.create({
        id: uuidv4(),
        tenantId: null,
        userId: 'SYSTEM',
        userName: 'System Auto-Purge',
        entityType: 'TELEMETRY',
        entityId: 'RETENTION_JOB',
        entityName: `Retention ${retentionDays} Days`,
        actionType: 'DELETE',
        details: JSON.stringify({ purgedRecords: totalPurged, cutoffDate: cutoffDate.toISOString() }),
      });
    }
  } catch (error) {
    console.error('❌ Telemetry Auto-Purge Error:', error.message);
  }
}

/**
 * Start the retention auto-purge background service
 */
function startRetentionPurgeService() {
  console.log('⏰ Initializing Telemetry Retention Auto-Purge Service (runs every 24 hours)...');
  
  // Run 1 minute after server start (gives DB time to finish sync)
  setTimeout(purgeOldTelemetry, 60 * 1000);

  // Schedule daily run
  setInterval(purgeOldTelemetry, PURGE_INTERVAL_MS);
}

module.exports = {
  purgeOldTelemetry,
  startRetentionPurgeService,
};
