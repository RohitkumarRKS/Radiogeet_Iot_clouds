const { Dashboard, User, Tenant } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search } = req.query;
    const where = {};

    // Role-based scoping
    if (req.user.role === 'SYS_ADMIN') {
      // SYS_ADMIN sees all dashboards (optionally filtered by tenantId)
      if (req.query.tenantId) where.tenantId = req.query.tenantId;
    } else if (req.user.role === 'CUSTOMER_USER') {
      // Customer users only see assigned dashboards
      where.tenantId = req.user.tenantId;
      const user = await User.findByPk(req.user.id);
      const assignedIds = user?.assignedDashboards || [];
      if (assignedIds.length > 0) {
        where.id = { [Op.in]: assignedIds };
      } else {
        // No assigned dashboards = empty result
        return res.json({ data: [], totalElements: 0, totalPages: 0 });
      }
    } else {
      // TENANT_ADMIN sees their tenant's dashboards
      where.tenantId = req.user.tenantId;
    }

    if (search) where.title = { [Op.like]: `%${search}%` };

    const { count, rows } = await Dashboard.findAndCountAll({
      where,
      attributes: ['id', 'title', 'description', 'image', 'createdAt', 'updatedAt'],
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      data: rows,
      totalElements: count,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const where = { id: req.params.id };

    // SYS_ADMIN can access any dashboard
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    const dashboard = await Dashboard.findOne({ where });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found.' });

    // Customer users can only view assigned dashboards
    if (req.user.role === 'CUSTOMER_USER') {
      const user = await User.findByPk(req.user.id);
      const assignedIds = user?.assignedDashboards || [];
      if (!assignedIds.includes(dashboard.id)) {
        return res.status(403).json({ error: 'You do not have access to this dashboard.' });
      }
    }

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, configuration } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    // Only TENANT_ADMIN and SYS_ADMIN can create dashboards
    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot create dashboards.' });
    }

    let tenantId = req.user?.role === 'SYS_ADMIN' && req.body.tenantId
      ? req.body.tenantId
      : req.user?.tenantId;

    // Verify tenantId exists in DB or fallback to default tenant
    let validTenant = null;
    if (tenantId) {
      validTenant = await Tenant.findByPk(tenantId);
    }
    if (!validTenant) {
      validTenant = await Tenant.findOne();
    }
    if (!validTenant) {
      const [defaultTenant] = await Tenant.findOrCreate({
        where: { name: 'Demo Organization' },
        defaults: { name: 'Demo Organization', plan: 'PRO' },
      });
      validTenant = defaultTenant;
    }
    tenantId = validTenant.id;

    const dashboard = await Dashboard.create({
      title,
      description: description || '',
      tenantId,
      configuration: configuration || { widgets: [], gridSettings: { columns: 24, margin: 10 } },
    });

    res.status(201).json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    // Customer users cannot edit dashboards
    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot edit dashboards.' });
    }

    const dashboard = await Dashboard.findOne({ where });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found.' });

    const { title, description, configuration } = req.body;
    if (title !== undefined) dashboard.title = title;
    if (description !== undefined) dashboard.description = description;
    if (configuration !== undefined) dashboard.configuration = configuration;

    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot delete dashboards.' });
    }

    const dashboard = await Dashboard.findOne({ where });
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found.' });

    await dashboard.destroy();
    res.json({ message: 'Dashboard deleted.' });
  } catch (error) {
    next(error);
  }
};

// Assign dashboard to customer user(s)
exports.assignToCustomer = async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { userIds } = req.body; // array of user IDs

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array.' });
    }

    const dashboard = await Dashboard.findByPk(dashboardId);
    if (!dashboard) return res.status(404).json({ error: 'Dashboard not found.' });

    // Only admin of same tenant or SYS_ADMIN can assign
    if (req.user.role !== 'SYS_ADMIN' && dashboard.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Cannot assign dashboards from another tenant.' });
    }

    const results = [];
    for (const userId of userIds) {
      const user = await User.findByPk(userId);
      if (!user) continue;

      const assigned = user.assignedDashboards || [];
      if (!assigned.includes(dashboardId)) {
        assigned.push(dashboardId);
        user.assignedDashboards = assigned;
        await user.save();
      }
      results.push({ userId, email: user.email, status: 'assigned' });
    }

    res.json({ message: 'Dashboard assigned.', results });
  } catch (error) {
    next(error);
  }
};
