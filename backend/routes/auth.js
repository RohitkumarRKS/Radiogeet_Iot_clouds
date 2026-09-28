const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const twoFAController = require('../controllers/twoFAController');
const { auth } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/token/refresh', authController.refreshToken);
router.get('/user', auth, authController.getUser);
router.put('/user', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

// ─── Two-Factor Authentication (2FA) Routes ──────────────────────────
router.post('/2fa/generate', auth, twoFAController.generate2FA);
router.post('/2fa/verify', auth, twoFAController.verify2FA);
router.post('/2fa/validate', twoFAController.validate2FA); // No auth — called during login
router.post('/2fa/disable', auth, twoFAController.disable2FA);
router.get('/2fa/status', auth, twoFAController.get2FAStatus);

module.exports = router;
