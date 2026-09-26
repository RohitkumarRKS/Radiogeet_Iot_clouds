const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cloudboard-secret-key-change-in-production';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers['x-authorization'] || req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['x-authorization'] || req.headers['authorization'];
    if (!authHeader) {
      const { Tenant } = require('../models');
      const tenant = await Tenant.findOne();
      req.user = { id: 'guest', tenantId: tenant ? tenant.id : null, role: 'GUEST' };
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const { Tenant } = require('../models');
    const tenant = await Tenant.findOne();
    req.user = { id: 'guest', tenantId: tenant ? tenant.id : null, role: 'GUEST' };
    next();
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

// Verify the user account is active (not deactivated)
const requireActive = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const user = await User.findByPk(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Super admin can access any tenant's data via ?tenantId= query param
const resolveTenantScope = (req, res, next) => {
  if (req.user.role === 'SYS_ADMIN' && req.query.tenantId) {
    req.scopedTenantId = req.query.tenantId;
  } else {
    req.scopedTenantId = req.user.tenantId;
  }
  next();
};

module.exports = { auth, optionalAuth, requireRole, requireActive, resolveTenantScope, JWT_SECRET };
