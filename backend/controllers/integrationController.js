const { Integration } = require('../models');
const { Op } = require('sequelize');

exports.getIntegrations = async (req, res, next) => {
  try {
    const { search } = req.query;
    const tenantId = req.user.tenantId;

    const where = { tenantId };
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const integrations = await Integration.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: integrations });
  } catch (error) {
    next(error);
  }
};

exports.createIntegration = async (req, res, next) => {
  try {
    const { name, type, configuration } = req.body;
    const tenantId = req.user.tenantId;

    const integration = await Integration.create({
      name,
      type: type || 'MQTT',
      status: 'ACTIVE',
      configuration: configuration || {},
      tenantId,
    });

    res.status(201).json(integration);
  } catch (error) {
    next(error);
  }
};

exports.deleteIntegration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const deleted = await Integration.destroy({ where: { id, tenantId } });
    if (!deleted) return res.status(404).json({ error: 'Integration not found' });

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    next(error);
  }
};
