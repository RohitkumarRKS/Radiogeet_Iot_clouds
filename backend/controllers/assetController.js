const { Asset, Customer } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search, type } = req.query;
    const where = { tenantId: req.user.tenantId };
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (type) where.type = type;

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [{ model: Customer, attributes: ['id', 'name'] }],
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: rows, totalElements: count, totalPages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: [{ model: Customer, attributes: ['id', 'name'] }],
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, type, label, customerId, additionalInfo } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const asset = await Asset.create({
      name, type: type || 'default', label: label || '',
      tenantId: req.user.tenantId, customerId, additionalInfo: additionalInfo || {},
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    const { name, type, label, customerId, additionalInfo } = req.body;
    if (name !== undefined) asset.name = name;
    if (type !== undefined) asset.type = type;
    if (label !== undefined) asset.label = label;
    if (customerId !== undefined) asset.customerId = customerId;
    if (additionalInfo !== undefined) asset.additionalInfo = additionalInfo;
    await asset.save();
    res.json(asset);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    await asset.destroy();
    res.json({ message: 'Asset deleted.' });
  } catch (error) {
    next(error);
  }
};
