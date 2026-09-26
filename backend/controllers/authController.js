const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Tenant, AuditLog } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

const generateTokens = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive !== false,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email }, include: [Tenant] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Super Admin accounts can ONLY log in via the Super Admin Portal
    const { isSuperAdminPortal } = req.body;
    if (user.role === 'SYS_ADMIN' && !isSuperAdminPortal) {
      return res.status(403).json({
        error: 'Super Admin accounts are restricted. Please log in via the Super Admin Portal (/superadmin-portal).'
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact your administrator.' });
    }

    const tokens = generateTokens(user);

    // Audit log
    try {
      await AuditLog.create({
        id: uuidv4(),
        tenantId: user.tenantId || null,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        entityType: 'USER',
        entityId: user.id,
        entityName: user.email,
        actionType: 'LOGIN',
      });
    } catch (auditErr) {
      console.error('AuditLog error during login:', auditErr.message);
    }

    res.json({
      ...tokens,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, tenantName } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Email, password, and first name are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: tenantName || `${firstName}'s Organization`,
    });

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName: lastName || '',
      role: 'TENANT_ADMIN',
      tenantId: tenant.id,
    });

    const tokens = generateTokens(user);

    // Audit log
    try {
      await AuditLog.create({
        id: uuidv4(),
        tenantId: tenant.id,
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        entityType: 'USER',
        entityId: user.id,
        entityName: user.email,
        actionType: 'ADDED',
      });
    } catch (auditErr) {
      console.error('AuditLog error during register:', auditErr.message);
    }

    res.status(201).json({
      ...tokens,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired.' });
    }
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [Tenant] });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userData = user.toJSON();
    // Include computed permission info for frontend
    userData.permissions = {
      tenantAllowedSidebarItems: user.Tenant?.allowedSidebarItems || null,
      userAllowedSidebarItems: user.allowedSidebarItems || null,
      assignedDashboards: user.assignedDashboards || [],
    };
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, countryCode, language, unitSystem, homeDashboard, hideHomeDashboardToolbar, hideChatBot } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    const info = { ...(user.additionalInfo || {}) };
    if (phone !== undefined) info.phone = phone;
    if (countryCode !== undefined) info.countryCode = countryCode;
    if (language !== undefined) info.language = language;
    if (unitSystem !== undefined) info.unitSystem = unitSystem;
    if (homeDashboard !== undefined) info.homeDashboard = homeDashboard;
    if (hideHomeDashboardToolbar !== undefined) info.hideHomeDashboardToolbar = hideHomeDashboardToolbar;
    if (hideChatBot !== undefined) info.hideChatBot = hideChatBot;

    user.additionalInfo = info;
    await user.save();

    const updatedUser = await User.findByPk(user.id, { include: [Tenant] });
    res.json(updatedUser.toJSON());
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    if (newPassword.length > 72) {
      return res.status(400).json({ error: 'New password must be at most 72 characters.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};
