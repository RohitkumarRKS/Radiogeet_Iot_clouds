const { AuditLog } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, entityType, actionType, search } = req.query;
    const where = { tenantId: req.user.tenantId };

    if (entityType) where.entityType = entityType;
    if (actionType) where.actionType = actionType;
    if (search) {
      where[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { entityName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: rows, totalElements: count, totalPages: Math.ceil(count / pageSize) });
  } catch (error) {
    next(error);
  }
};
