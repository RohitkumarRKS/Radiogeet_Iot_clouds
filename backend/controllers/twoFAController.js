/**
 * Two-Factor Authentication (2FA) Controller
 * Implements TOTP (Time-based One-Time Password) for Google Authenticator / Authy
 * 
 * Flow:
 * 1. POST /api/auth/2fa/generate  → Generate QR code + secret for user
 * 2. POST /api/auth/2fa/verify    → Verify TOTP code and activate 2FA
 * 3. POST /api/auth/2fa/validate  → Validate TOTP during login (when 2FA is enabled)
 * 4. POST /api/auth/2fa/disable   → Disable 2FA (requires current TOTP code)
 * 5. GET  /api/auth/2fa/status    → Check 2FA status for current user
 */
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User } = require('../models');

const APP_NAME = process.env.APP_NAME || 'Radiogeet IoT Cloud';

/**
 * Generate a new 2FA secret and QR code for the user
 * Called when user wants to SET UP 2FA for the first time
 */
exports.generate2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.twoFAEnabled && user.twoFAVerified) {
      return res.status(400).json({
        error: '2FA is already enabled. Disable it first to regenerate.',
      });
    }

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
      issuer: APP_NAME,
      length: 20,
    });

    // Save the secret (not yet activated — user must verify first)
    user.twoFASecret = secret.base32;
    user.twoFAEnabled = false;
    user.twoFAVerified = false;
    await user.save();

    // Generate QR code as data URL for scanning
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: 'Scan the QR code with Google Authenticator or Authy, then verify with a code.',
      qrCode: qrCodeDataUrl,
      manualKey: secret.base32,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a TOTP code to ACTIVATE 2FA
 * User scans QR code, then enters the 6-digit code shown in their authenticator app
 */
exports.verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: '2FA verification code is required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.twoFASecret) {
      return res.status(400).json({
        error: 'No 2FA secret found. Please generate a QR code first (POST /api/auth/2fa/generate).',
      });
    }

    // Verify the TOTP token
    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: token.toString(),
      window: 2, // Allow 2 time-steps tolerance (±60 seconds)
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code. Please try again.' });
    }

    // Activate 2FA
    user.twoFAEnabled = true;
    user.twoFAVerified = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA has been successfully enabled! You will now need your authenticator app to log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate a TOTP code during LOGIN
 * Called after password verification when user has 2FA enabled
 */
exports.validate2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and 2FA code are required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.twoFAEnabled || !user.twoFASecret) {
      return res.status(400).json({ error: '2FA is not enabled for this account.' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: token.toString(),
      window: 2,
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code. Please try again.' });
    }

    // Generate full JWT tokens upon successful 2FA validation
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const { v4: uuidv4 } = require('uuid');
    const { AuditLog } = require('../models');

    const accessToken = jwt.sign(
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

    // Audit log for 2FA-verified login
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
      console.error('AuditLog error during 2FA login:', auditErr.message);
    }

    res.json({
      token: accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA for the current user
 * Requires current TOTP code for security verification
 */
exports.disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Current 2FA code is required to disable.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.twoFAEnabled) {
      return res.status(400).json({ error: '2FA is not currently enabled.' });
    }

    // Verify the code before disabling
    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: token.toString(),
      window: 2,
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code. Cannot disable.' });
    }

    user.twoFASecret = null;
    user.twoFAEnabled = false;
    user.twoFAVerified = false;
    await user.save();

    res.json({
      success: true,
      message: '2FA has been disabled. Your account now uses password-only authentication.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check 2FA status for current authenticated user
 */
exports.get2FAStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      twoFAEnabled: user.twoFAEnabled || false,
      twoFAVerified: user.twoFAVerified || false,
    });
  } catch (error) {
    next(error);
  }
};
