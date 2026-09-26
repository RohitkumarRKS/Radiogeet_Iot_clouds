const { Alarm } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, severity, status, search, startTs, endTs } = req.query;
    const where = { tenantId: req.user.tenantId };

    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { type: { [Op.like]: `%${search}%` } },
        { originatorName: { [Op.like]: `%${search}%` } },
      ];
    }
    if (startTs || endTs) {
      where.startTs = {};
      if (startTs) where.startTs[Op.gte] = new Date(parseInt(startTs));
      if (endTs) where.startTs[Op.lte] = new Date(parseInt(endTs));
    }

    const { count, rows } = await Alarm.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['startTs', 'DESC']],
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
    const alarm = await Alarm.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!alarm) return res.status(404).json({ error: 'Alarm not found.' });
    res.json(alarm);
  } catch (error) {
    next(error);
  }
};

exports.acknowledge = async (req, res, next) => {
  try {
    const alarm = await Alarm.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!alarm) return res.status(404).json({ error: 'Alarm not found.' });

    if (alarm.status === 'ACTIVE_UNACK') {
      alarm.status = 'ACTIVE_ACK';
    } else if (alarm.status === 'CLEARED_UNACK') {
      alarm.status = 'CLEARED_ACK';
    }
    alarm.ackTs = new Date();
    await alarm.save();

    res.json(alarm);
  } catch (error) {
    next(error);
  }
};

exports.clear = async (req, res, next) => {
  try {
    const alarm = await Alarm.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!alarm) return res.status(404).json({ error: 'Alarm not found.' });

    if (alarm.status === 'ACTIVE_UNACK') {
      alarm.status = 'CLEARED_UNACK';
    } else if (alarm.status === 'ACTIVE_ACK') {
      alarm.status = 'CLEARED_ACK';
    }
    alarm.clearTs = new Date();
    alarm.endTs = new Date();
    await alarm.save();

    res.json(alarm);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const alarm = await Alarm.findOne({
      where: { id: req.params.id, tenantId: req.user.tenantId },
    });
    if (!alarm) return res.status(404).json({ error: 'Alarm not found.' });

    await alarm.destroy();
    res.json({ message: 'Alarm deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getByEntity = async (req, res, next) => {
  try {
    const { entityId } = req.params;
    const alarms = await Alarm.findAll({
      where: { originatorId: entityId, tenantId: req.user.tenantId },
      order: [['startTs', 'DESC']],
      limit: 50,
    });
    res.json({ data: alarms });
  } catch (error) {
    next(error);
  }
};
