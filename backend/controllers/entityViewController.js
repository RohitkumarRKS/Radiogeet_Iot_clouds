const { EntityView, Customer } = require('../models');
const { Op } = require('sequelize');

exports.getEntityViews = async (req, res, next) => {
  try {
    const { search } = req.query;
    const tenantId = req.user.tenantId;

    const where = { tenantId };
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const entityViews = await EntityView.findAll({
      where,
      include: [{ model: Customer, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: entityViews });
  } catch (error) {
    next(error);
  }
};

exports.createEntityView = async (req, res, next) => {
  try {
    const { name, type, entityType, entityId, keys, customerId } = req.body;
    const tenantId = req.user.tenantId;

    const entityView = await EntityView.create({
      name,
      type: type || 'default',
      entityType: entityType || 'DEVICE',
      entityId,
      keys: keys || [],
      customerId: customerId || null,
      tenantId,
    });

    res.status(201).json(entityView);
  } catch (error) {
    next(error);
  }
};

exports.deleteEntityView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const deleted = await EntityView.destroy({ where: { id, tenantId } });
    if (!deleted) return res.status(404).json({ error: 'Entity View not found' });

    res.json({ message: 'Entity View deleted successfully' });
  } catch (error) {
    next(error);
  }
};
