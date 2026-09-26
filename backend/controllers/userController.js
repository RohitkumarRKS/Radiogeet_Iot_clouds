const { User, Tenant, Customer, Dashboard, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Get users for tenant (or all users if SYS_ADMIN)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 0, pageSize = 50, search, role, isActive, customerId } = req.query;
    const where = {};

    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    } else if (req.query.tenantId) {
      where.tenantId = req.query.tenantId;
    }

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (customerId) where.customerId = customerId;

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        { model: Tenant, attributes: ['id', 'name', 'plan', 'allowedSidebarItems'] },
        { model: Customer, attributes: ['id', 'title'] },
      ],
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

// Get single user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    const user = await User.findOne({
      where,
      include: [
        { model: Tenant, attributes: ['id', 'name', 'plan', 'allowedSidebarItems'] },
        { model: Customer, attributes: ['id', 'title'] },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create new user in tenant
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, customerId, assignedDashboards, allowedSidebarItems } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Email, password, and first name are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    // Customer users can only be created by Admins
    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot create accounts.' });
    }

    const tenantId = req.user.role === 'SYS_ADMIN' && req.body.tenantId
      ? req.body.tenantId
      : req.user.tenantId;

    // Tenant admin cannot create SYS_ADMIN
    const assignedRole = (req.user.role !== 'SYS_ADMIN' && role === 'SYS_ADMIN')
      ? 'CUSTOMER_USER'
      : (role || 'CUSTOMER_USER');

    const user = await User.create({
      email,
      password,
      firstName,
      lastName: lastName || '',
      role: assignedRole,
      tenantId,
      customerId: customerId || null,
      assignedDashboards: assignedDashboards || [],
      allowedSidebarItems: allowedSidebarItems || null,
      isActive: true,
    });

    // Audit log
    try {
      await AuditLog.create({
        id: uuidv4(),
        tenantId,
        userId: req.user.id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email,
        entityType: 'USER',
        entityId: user.id,
        entityName: user.email,
        actionType: 'ADDED',
      });
    } catch (e) { /* ignore audit errors */ }

    const created = await User.findByPk(user.id, {
      include: [Tenant, Customer],
      attributes: { exclude: ['password'] },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot edit users.' });
    }

    const user = await User.findOne({ where });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { firstName, lastName, role, customerId, isActive, assignedDashboards, allowedSidebarItems, password } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (role !== undefined && req.user.role === 'SYS_ADMIN') user.role = role;
    if (customerId !== undefined) user.customerId = customerId;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedDashboards !== undefined) user.assignedDashboards = assignedDashboards;
    if (allowedSidebarItems !== undefined) user.allowedSidebarItems = allowedSidebarItems;
    if (password) user.password = password;

    await user.save();

    const updated = await User.findByPk(user.id, {
      include: [Tenant, Customer],
      attributes: { exclude: ['password'] },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const where = { id: req.params.id };
    if (req.user.role !== 'SYS_ADMIN') {
      where.tenantId = req.user.tenantId;
    }

    if (req.user.role === 'CUSTOMER_USER') {
      return res.status(403).json({ error: 'Customer users cannot delete users.' });
    }

    const user = await User.findOne({ where });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account.' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
