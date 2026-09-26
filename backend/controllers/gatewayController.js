const { Device, DeviceProfile, Telemetry, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all Edge & Protocol Gateways for the tenant
 */
exports.getAll = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const where = {
      tenantId,
      [Op.or]: [
        { isGateway: true },
        { type: 'gateway' },
      ],
    };

    const gateways = await Device.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    // Also get all devices for this tenant to compute connected sub-devices
    const allDevices = await Device.findAll({
      where: { tenantId, isGateway: false },
      attributes: ['id', 'name', 'type', 'isActive', 'additionalInfo', 'lastActivityTime'],
    });

    const now = Date.now();
    const result = gateways.map((gw) => {
      const info = gw.additionalInfo || {};
      const subDevices = allDevices.filter(d => d.additionalInfo && d.additionalInfo.gatewayId === gw.id);

      // A gateway is strictly ONLINE if it has communicated in the last 60 seconds
      const isGwOnline = Boolean(gw.isActive && gw.lastActivityTime && (now - new Date(gw.lastActivityTime).getTime() < 60000));

      return {
        id: gw.id,
        name: gw.name,
        label: gw.label || gw.name,
        type: info.protocolType || gw.type || 'Modbus Gateway',
        protocolType: info.protocolType || 'Modbus TCP / RTU',
        status: isGwOnline ? 'ONLINE' : 'OFFLINE',
        isActive: isGwOnline,
        accessToken: gw.accessToken,
        ip: info.ip || '192.168.1.100',
        port: info.port || (info.protocolType?.includes('Modbus') ? 502 : 1883),
        pollInterval: info.pollInterval || 5000,
        description: info.description || gw.label || '',
        connectedDevices: subDevices.length,
        subDevices: subDevices.map(sd => {
          const isSdOnline = Boolean(sd.isActive && sd.lastActivityTime && (now - new Date(sd.lastActivityTime).getTime() < 60000));
          return {
            id: sd.id,
            name: sd.name,
            type: sd.type,
            status: isSdOnline ? 'ONLINE' : 'OFFLINE',
            lastSeen: sd.lastActivityTime ? new Date(sd.lastActivityTime).toLocaleString() : 'Never',
          };
        }),
        lastSeen: gw.lastActivityTime ? new Date(gw.lastActivityTime).toLocaleString() : 'Never (Waiting for connection)',
        createdAt: gw.createdAt,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Gateway details and its sub-devices with latest telemetry
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const gateway = await Device.findOne({
      where: { id, tenantId },
    });

    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found.' });
    }

    const info = gateway.additionalInfo || {};

    // Find all sub-devices attached to this gateway
    const allDevices = await Device.findAll({
      where: { tenantId, isGateway: false },
    });

    const subDevices = allDevices.filter(d => d.additionalInfo && d.additionalInfo.gatewayId === gateway.id);

    // Get latest telemetry for each sub-device
    const subDevicesWithTelemetry = await Promise.all(
      subDevices.map(async (sd) => {
        const latestPoints = await Telemetry.findAll({
          where: { entityId: sd.id },
          attributes: ['key', 'value', 'stringValue', 'timestamp'],
          order: [['timestamp', 'DESC']],
          group: ['key'],
        });

        const telemetry = {};
        latestPoints.forEach(p => {
          telemetry[p.key] = {
            value: p.value,
            stringValue: p.stringValue,
            ts: p.timestamp,
          };
        });

        const isSdOnline = Boolean(sd.isActive && sd.lastActivityTime && (Date.now() - new Date(sd.lastActivityTime).getTime() < 60000));
        return {
          id: sd.id,
          name: sd.name,
          label: sd.label,
          type: sd.type,
          accessToken: sd.accessToken,
          status: isSdOnline ? 'ONLINE' : 'OFFLINE',
          lastSeen: sd.lastActivityTime ? new Date(sd.lastActivityTime).toLocaleString() : 'Never',
          telemetry,
        };
      })
    );

    const isGwOnline = Boolean(gateway.isActive && gateway.lastActivityTime && (Date.now() - new Date(gateway.lastActivityTime).getTime() < 60000));

    res.json({
      id: gateway.id,
      name: gateway.name,
      label: gateway.label,
      type: info.protocolType || gateway.type || 'Modbus Gateway',
      protocolType: info.protocolType || 'Modbus TCP / RTU',
      status: isGwOnline ? 'ONLINE' : 'OFFLINE',
      isActive: isGwOnline,
      accessToken: gateway.accessToken,
      ip: info.ip || '192.168.1.100',
      port: info.port || 502,
      pollInterval: info.pollInterval || 5000,
      baudRate: info.baudRate || 9600,
      description: info.description || '',
      connectedDevicesCount: subDevices.length,
      subDevices: subDevicesWithTelemetry,
      lastSeen: gateway.lastActivityTime ? new Date(gateway.lastActivityTime).toLocaleString() : 'Never',
      createdAt: gateway.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Gateway
 */
exports.create = async (req, res, next) => {
  try {
    const { name, protocolType, ip, port, pollInterval, baudRate, description } = req.body;
    const tenantId = req.user.tenantId;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Gateway name is required.' });
    }

    // Find default gateway profile if exists
    const profile = await DeviceProfile.findOne({
      where: { tenantId, type: 'GATEWAY' },
    });

    const token = 'gw_' + uuidv4().replace(/-/g, '').substring(0, 16);

    const gateway = await Device.create({
      name: name.trim(),
      label: description || `${protocolType || 'Modbus'} Edge Gateway`,
      type: 'gateway',
      isGateway: true,
      isActive: false, // Starts OFFLINE until physical gateway makes first connection
      tenantId,
      deviceProfileId: profile ? profile.id : null,
      accessToken: token,
      additionalInfo: {
        protocolType: protocolType || 'Modbus TCP / RTU',
        ip: ip || '192.168.1.100',
        port: port ? parseInt(port) : (protocolType?.includes('Modbus') ? 502 : 1883),
        pollInterval: pollInterval ? parseInt(pollInterval) : 5000,
        baudRate: baudRate ? parseInt(baudRate) : 9600,
        description: description || '',
      },
    });

    res.status(201).json(gateway);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Gateway
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, protocolType, ip, port, pollInterval, baudRate, description, isActive } = req.body;
    const tenantId = req.user.tenantId;

    const gateway = await Device.findOne({ where: { id, tenantId } });
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found.' });
    }

    const currentInfo = gateway.additionalInfo || {};
    const updatedInfo = {
      ...currentInfo,
      protocolType: protocolType !== undefined ? protocolType : currentInfo.protocolType,
      ip: ip !== undefined ? ip : currentInfo.ip,
      port: port !== undefined ? parseInt(port) : currentInfo.port,
      pollInterval: pollInterval !== undefined ? parseInt(pollInterval) : currentInfo.pollInterval,
      baudRate: baudRate !== undefined ? parseInt(baudRate) : currentInfo.baudRate,
      description: description !== undefined ? description : currentInfo.description,
    };

    await gateway.update({
      name: name !== undefined ? name.trim() : gateway.name,
      label: description !== undefined ? description : gateway.label,
      isActive: isActive !== undefined ? isActive : gateway.isActive,
      additionalInfo: updatedInfo,
    });

    res.json(gateway);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Gateway and optionally detach sub-devices
 */
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const gateway = await Device.findOne({ where: { id, tenantId } });
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found.' });
    }

    // Detach sub-devices from this gateway
    const allDevices = await Device.findAll({ where: { tenantId } });
    for (const d of allDevices) {
      if (d.additionalInfo && d.additionalInfo.gatewayId === gateway.id) {
        const nextInfo = { ...d.additionalInfo };
        delete nextInfo.gatewayId;
        await d.update({ additionalInfo: nextInfo });
      }
    }

    await gateway.destroy();
    res.json({ message: 'Gateway removed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate Gateway Access Token
 */
exports.regenerateCredentials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const gateway = await Device.findOne({ where: { id, tenantId } });
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found.' });
    }

    const newToken = 'gw_' + uuidv4().replace(/-/g, '').substring(0, 16);
    await gateway.update({ accessToken: newToken });

    res.json({ accessToken: newToken });
  } catch (error) {
    next(error);
  }
};
