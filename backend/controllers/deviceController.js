const { Device, DeviceProfile, Customer, Telemetry, Alarm } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search, type, isActive } = req.query;
    const where = {};
    if (req.user.role !== 'SYS_ADMIN' || req.user.tenantId) {
      if (req.user.tenantId) where.tenantId = req.user.tenantId;
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await Device.findAndCountAll({
      where,
      include: [
        { model: DeviceProfile, attributes: ['id', 'name', 'type'] },
        { model: Customer, attributes: ['id', 'name'] },
      ],
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      totalElements: count,
      totalPages: Math.ceil(count / pageSize),
      hasNext: (parseInt(page) + 1) * parseInt(pageSize) < count,
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN' && req.user.tenantId) {
      where.tenantId = req.user.tenantId;
    }

    const device = await Device.findOne({
      where,
      include: [
        { model: DeviceProfile },
        { model: Customer, attributes: ['id', 'name'] },
      ],
    });
    if (!device) return res.status(404).json({ error: 'Device not found.' });
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, type, label, deviceProfileId, isGateway, accessToken, additionalInfo } = req.body;
    if (!name) return res.status(400).json({ error: 'Device name is required.' });

    let tenantId = req.user?.tenantId;
    const { Tenant } = require('../models');
    if (tenantId) {
      const existing = await Tenant.findByPk(tenantId);
      if (!existing) tenantId = null;
    }
    if (!tenantId) {
      const tenant = await Tenant.findOne();
      if (tenant) {
        tenantId = tenant.id;
      } else {
        const [defaultTenant] = await Tenant.findOrCreate({
          where: { name: 'Demo Organization' },
          defaults: { name: 'Demo Organization', plan: 'PRO' },
        });
        tenantId = defaultTenant.id;
      }
    }

    const device = await Device.create({
      name,
      type: type || 'default',
      label: label || '',
      tenantId,
      deviceProfileId,
      isGateway: isGateway || false,
      accessToken: accessToken || uuidv4().replace(/-/g, '').substring(0, 20),
      additionalInfo: additionalInfo || {},
    });

    res.status(201).json(device);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!device) return res.status(404).json({ error: 'Device not found.' });

    const { name, type, label, deviceProfileId, isGateway, customerId, additionalInfo } = req.body;
    if (name !== undefined) device.name = name;
    if (type !== undefined) device.type = type;
    if (label !== undefined) device.label = label;
    if (deviceProfileId !== undefined) device.deviceProfileId = deviceProfileId;
    if (isGateway !== undefined) device.isGateway = isGateway;
    if (customerId !== undefined) device.customerId = customerId;
    if (additionalInfo !== undefined) device.additionalInfo = additionalInfo;

    await device.save();
    res.json(device);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!device) return res.status(404).json({ error: 'Device not found.' });

    await Telemetry.destroy({ where: { entityId: device.id } });
    await Alarm.destroy({ where: { originatorId: device.id } });
    await device.destroy();

    res.json({ message: 'Device deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getCredentials = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      attributes: ['id', 'accessToken'],
    });
    if (!device) return res.status(404).json({ error: 'Device not found.' });
    res.json({ accessToken: device.accessToken });
  } catch (error) {
    next(error);
  }
};

exports.regenerateCredentials = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!device) return res.status(404).json({ error: 'Device not found.' });

    device.accessToken = uuidv4().replace(/-/g, '').substring(0, 20);
    await device.save();

    res.json({ accessToken: device.accessToken });
  } catch (error) {
    next(error);
  }
};

// Device Profiles
exports.getProfiles = async (req, res, next) => {
  try {
    const profiles = await DeviceProfile.findAll({
      where: { tenantId: req.user.tenantId },
      order: [['name', 'ASC']],
    });
    res.json({ data: profiles });
  } catch (error) {
    next(error);
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    const { name, description, type, transportType } = req.body;
    const profile = await DeviceProfile.create({
      name,
      description,
      type: type || 'DEFAULT',
      transportType: transportType || 'MQTT',
      tenantId: req.user.tenantId,
    });
    res.status(201).json(profile);
  } catch (error) {
    next(error);
  }
};

exports.sendRpc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method, params } = req.body;

    const where = { id };
    if (req.user.role !== 'SYS_ADMIN' && req.user.tenantId) {
      where.tenantId = req.user.tenantId;
    }

    const device = await Device.findOne({ where });
    if (!device) return res.status(404).json({ error: 'Device not found.' });

    const { sendRpcCommand } = require('../services/mqttServer');
    const result = await sendRpcCommand(device.id, { method: method || 'getValue', params: params !== undefined ? params : {} });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

