const { Notification } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({ where: { userId: req.user.id, status: 'UNREAD' } });

    res.json({ data: rows, totalElements: count, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return res.status(404).json({ error: 'Notification not found.' });

    notif.status = 'READ';
    await notif.save();
    res.json(notif);
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { status: 'READ' },
      { where: { userId: req.user.id, status: 'UNREAD' } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return res.status(404).json({ error: 'Notification not found.' });
    await notif.destroy();
    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};
