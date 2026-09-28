const { Telemetry, Device } = require('../models');
const { Op } = require('sequelize');

exports.getLatest = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const { keys } = req.query;

    let where = { entityId };
    if (keys) {
      where.key = { [Op.in]: keys.split(',') };
    }

    // Get latest for each key
    const telemetryKeys = await Telemetry.findAll({
      where: { entityId },
      attributes: ['key'],
      group: ['key'],
    });

    const latest = [];
    for (const tk of telemetryKeys) {
      if (keys && !keys.split(',').includes(tk.key)) continue;
      const entry = await Telemetry.findOne({
        where: { entityId, key: tk.key },
        order: [['timestamp', 'DESC']],
      });
      if (entry) latest.push(entry);
    }

    res.json(latest);
  } catch (error) {
    next(error);
  }
};

exports.getTimeSeries = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const {
      keys,
      startTs,
      endTs,
      limit = 500,
      orderBy = 'ASC',
    } = req.query;

    const where = { entityId };

    if (keys) {
      where.key = { [Op.in]: keys.split(',') };
    }

    if (startTs || endTs) {
      where.timestamp = {};
      if (startTs) where.timestamp[Op.gte] = new Date(parseInt(startTs));
      if (endTs) where.timestamp[Op.lte] = new Date(parseInt(endTs));
    }

    const data = await Telemetry.findAll({
      where,
      order: [['timestamp', orderBy]],
      limit: parseInt(limit),
    });

    // Group by key
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.key]) grouped[item.key] = [];
      grouped[item.key].push({
        ts: item.timestamp.getTime(),
        value: item.value,
      });
    });

    res.json(grouped);
  } catch (error) {
    next(error);
  }
};

exports.pushTelemetry = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    let bodyObj = req.body;
    if (typeof bodyObj === 'string') {
      try { bodyObj = JSON.parse(bodyObj); } catch (e) { bodyObj = {}; }
    }
    bodyObj = bodyObj && typeof bodyObj === 'object' ? bodyObj : {};
    const queryObj = req.query && typeof req.query === 'object' ? req.query : {};
    const { ts, values } = bodyObj;

    const data = values || (Object.keys(bodyObj).length > 0 ? bodyObj : queryObj);
    const timestamp = ts ? new Date(ts).getTime() : Date.now();

    const { processTelemetry } = require('../services/telemetryService');
    const created = await processTelemetry(entityId, data, timestamp);

    res.json({ message: 'Telemetry saved successfully.', count: created ? created.length : 0 });
  } catch (error) {
    next(error);
  }
};

// Public endpoint - devices push telemetry using their access token
exports.pushByAccessToken = async (req, res, next) => {
  try {
    const { accessToken } = req.params;
    const device = await Device.findOne({ where: { accessToken } });

    if (!device) {
      return res.status(401).json({ error: 'Invalid access token.' });
    }

    req.params.entityId = device.id;
    return exports.pushTelemetry(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Public endpoint - gateways push telemetry for multiple sub-devices
exports.pushGatewayTelemetry = async (req, res, next) => {
  try {
    const accessToken = req.params.accessToken || req.headers['x-authorization'] || req.query.token;
    const gateway = await Device.findOne({ where: { accessToken } });

    if (!gateway) {
      return res.status(401).json({ error: 'Invalid gateway access token.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid payload format. Expected JSON mapping sub-devices to telemetry.' });
    }

    const { processTelemetry } = require('../services/telemetryService');
    const processedDevices = [];

    // Check if payload is direct flat tags (e.g. { "temp": 25.4, "pressure": 6.8 })
    const isDirectFlat = Object.values(body).every(val => typeof val !== 'object' || val === null);

    if (isDirectFlat) {
      await processTelemetry(gateway.id, body, Date.now());
      processedDevices.push(gateway.name);
    } else {
      for (const [subDeviceName, subData] of Object.entries(body)) {
        if (!subDeviceName) continue;

        // If scalar value, treat as gateway's direct tag
        if (typeof subData !== 'object' || subData === null) {
          await processTelemetry(gateway.id, { [subDeviceName]: subData }, Date.now());
          continue;
        }

        const [subDevice] = await Device.findOrCreate({
          where: { name: subDeviceName, tenantId: gateway.tenantId },
          defaults: {
            name: subDeviceName,
            type: 'sensor',
            label: `Gateway Device (${gateway.name})`,
            tenantId: gateway.tenantId,
            customerId: gateway.customerId,
            isActive: true,
            additionalInfo: { gatewayId: gateway.id }
          }
        });

        if (Array.isArray(subData)) {
          for (const item of subData) {
            const values = item.values || item;
            const ts = item.ts ? new Date(item.ts).getTime() : Date.now();
            await processTelemetry(subDevice.id, values, ts);
          }
        } else {
          await processTelemetry(subDevice.id, subData, Date.now());
        }
        processedDevices.push(subDeviceName);
      }
    }

    // Update gateway last activity
    await gateway.update({ lastActivityTime: new Date(), isActive: true });

    res.json({
      message: 'Gateway telemetry processed successfully.',
      gateway: gateway.name,
      subDevicesCount: processedDevices.length,
      devices: processedDevices
    });
  } catch (error) {
    next(error);
  }
};

exports.clearAllTelemetry = async (req, res, next) => {
  try {
    await Telemetry.destroy({ where: {}, truncate: true });
    res.json({ message: 'All telemetry records cleared successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

