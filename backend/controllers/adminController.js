const { User, Tenant, Dashboard, Device, Asset, Alarm, Customer, AuditLog } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ============ TENANT MANAGEMENT ============

exports.getAllTenants = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search } = req.query;
    const where = {};
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Tenant.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    // Get user counts per tenant
    const tenantsWithCounts = await Promise.all(
      rows.map(async (tenant) => {
        const userCount = await User.count({ where: { tenantId: tenant.id } });
        const dashboardCount = await Dashboard.count({ where: { tenantId: tenant.id } });
        const deviceCount = await Device.count({ where: { tenantId: tenant.id } });
        return {
          ...tenant.toJSON(),
          userCount,
          dashboardCount,
          deviceCount,
        };
      })
    );

    res.json({
      data: tenantsWithCounts,
      totalElements: count,
      totalPages: Math.ceil(count / parseInt(pageSize)),
    });
  } catch (error) {
    next(error);
  }
};

exports.getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    const userCount = await User.count({ where: { tenantId: tenant.id } });
    const dashboardCount = await Dashboard.count({ where: { tenantId: tenant.id } });
    const deviceCount = await Device.count({ where: { tenantId: tenant.id } });
    const customerCount = await Customer.count({ where: { tenantId: tenant.id } });

    res.json({
      ...tenant.toJSON(),
      userCount,
      dashboardCount,
      deviceCount,
      customerCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    const { name, description, plan, country, city, allowedSidebarItems, additionalInfo } = req.body;
    if (name !== undefined) tenant.name = name;
    if (description !== undefined) tenant.description = description;
    if (plan !== undefined) tenant.plan = plan;
    if (country !== undefined) tenant.country = country;
    if (city !== undefined) tenant.city = city;
    if (allowedSidebarItems !== undefined) tenant.allowedSidebarItems = allowedSidebarItems;
    if (additionalInfo !== undefined) tenant.additionalInfo = additionalInfo;

    await tenant.save();

    // Audit log
    try {
      await AuditLog.create({
        id: uuidv4(),
        tenantId: tenant.id,
        userId: req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
        entityType: 'TENANT',
        entityId: tenant.id,
        entityName: tenant.name,
        actionType: 'UPDATED',
      });
    } catch (e) { /* ignore audit errors */ }

    res.json(tenant);
  } catch (error) {
    next(error);
  }
};

exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    // Don't allow deleting the system tenant
    const sysUsers = await User.findAll({ where: { tenantId: tenant.id, role: 'SYS_ADMIN' } });
    if (sysUsers.length > 0) {
      return res.status(403).json({ error: 'Cannot delete the system administration tenant.' });
    }

    // Delete all associated data
    await User.destroy({ where: { tenantId: tenant.id } });
    await Dashboard.destroy({ where: { tenantId: tenant.id } });
    await Device.destroy({ where: { tenantId: tenant.id } });
    await Asset.destroy({ where: { tenantId: tenant.id } });
    await Customer.destroy({ where: { tenantId: tenant.id } });
    await Alarm.destroy({ where: { tenantId: tenant.id } });

    await tenant.destroy();

    res.json({ message: 'Tenant and all associated data deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.createTenant = async (req, res, next) => {
  try {
    const { name, description, plan, country, city } = req.body;
    if (!name) return res.status(400).json({ error: 'Tenant name is required.' });

    const tenant = await Tenant.create({
      name,
      description: description || '',
      plan: plan || 'FREE',
      country: country || '',
      city: city || '',
    });

    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
};

// ============ USER MANAGEMENT (ALL USERS) ============

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search, tenantId, role, isActive } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }
    if (tenantId) where.tenantId = tenantId;
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Tenant, attributes: ['id', 'name', 'plan'] }],
      attributes: { exclude: ['password'] },
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      totalElements: count,
      totalPages: Math.ceil(count / parseInt(pageSize)),
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Tenant, attributes: ['id', 'name', 'plan', 'allowedSidebarItems'] }],
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, tenantId, customerId, assignedDashboards, allowedSidebarItems } = req.body;

    if (!email || !password || !firstName || !tenantId) {
      return res.status(400).json({ error: 'Email, password, firstName, and tenantId are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    const user = await User.create({
      email,
      password,
      firstName,
      lastName: lastName || '',
      role: role || 'CUSTOMER_USER',
      tenantId,
      customerId: customerId || null,
      assignedDashboards: assignedDashboards || [],
      allowedSidebarItems: allowedSidebarItems || null,
    });

    // Audit log
    try {
      await AuditLog.create({
        id: uuidv4(),
        tenantId,
        userId: req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
        entityType: 'USER',
        entityId: user.id,
        entityName: user.email,
        actionType: 'ADDED',
      });
    } catch (e) { /* ignore audit errors */ }

    const created = await User.findByPk(user.id, {
      include: [Tenant],
      attributes: { exclude: ['password'] },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { firstName, lastName, role, tenantId, customerId, isActive, assignedDashboards, allowedSidebarItems, password } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined) user.role = role;
    if (tenantId !== undefined) user.tenantId = tenantId;
    if (customerId !== undefined) user.customerId = customerId;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedDashboards !== undefined) user.assignedDashboards = assignedDashboards;
    if (allowedSidebarItems !== undefined) user.allowedSidebarItems = allowedSidebarItems;
    if (password) user.password = password;

    await user.save();

    const updated = await User.findByPk(user.id, {
      include: [Tenant],
      attributes: { exclude: ['password'] },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Don't allow deleting yourself
    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account.' });
    }

    await user.destroy();
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// ============ ALL DASHBOARDS ============

exports.getAllDashboards = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 20, search, tenantId } = req.query;
    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (tenantId) where.tenantId = tenantId;

    const { count, rows } = await Dashboard.findAndCountAll({
      where,
      include: [{ model: Tenant, attributes: ['id', 'name'] }],
      attributes: ['id', 'title', 'description', 'image', 'createdAt', 'updatedAt', 'tenantId'],
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['updatedAt', 'DESC']],
    });

    res.json({
      data: rows,
      totalElements: count,
      totalPages: Math.ceil(count / parseInt(pageSize)),
    });
  } catch (error) {
    next(error);
  }
};

// ============ PLATFORM STATS ============

exports.getStats = async (req, res, next) => {
  try {
    const [tenantCount, userCount, deviceCount, dashboardCount, alarmCount, customerCount] =
      await Promise.all([
        Tenant.count(),
        User.count(),
        Device.count(),
        Dashboard.count(),
        Alarm.count(),
        Customer.count(),
      ]);

    // Active users in last 24h (users who logged in)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = await AuditLog.count({
      where: {
        actionType: 'LOGIN',
        createdAt: { [Op.gte]: oneDayAgo },
      },
    });

    // Users by role
    const sysAdmins = await User.count({ where: { role: 'SYS_ADMIN' } });
    const tenantAdmins = await User.count({ where: { role: 'TENANT_ADMIN' } });
    const customerUsers = await User.count({ where: { role: 'CUSTOMER_USER' } });

    // Active vs inactive users
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    res.json({
      tenantCount,
      userCount,
      deviceCount,
      dashboardCount,
      alarmCount,
      customerCount,
      recentLogins,
      usersByRole: { sysAdmins, tenantAdmins, customerUsers },
      usersByStatus: { active: activeUsers, inactive: inactiveUsers },
    });
  } catch (error) {
    next(error);
  }
};

exports.cleanDemoData = async (req, res, next) => {
  try {
    const { Device, Dashboard, Telemetry, Alarm } = require('../models');

    await Telemetry.destroy({ where: {}, truncate: true }).catch(() => Telemetry.destroy({ where: {} }));
    await Alarm.destroy({ where: {}, truncate: true }).catch(() => Alarm.destroy({ where: {} }));
    await Device.destroy({ where: {}, truncate: true }).catch(() => Device.destroy({ where: {} }));
    await Dashboard.destroy({ where: {}, truncate: true }).catch(() => Dashboard.destroy({ where: {} }));

    res.json({
      success: true,
      message: 'All demo devices, dashboards, telemetry points, and alarms have been completely cleared.',
    });
  } catch (error) {
    next(error);
  }
};
