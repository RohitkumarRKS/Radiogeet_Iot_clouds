const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/token/refresh', authController.refreshToken);
router.get('/user', auth, authController.getUser);
router.put('/user', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

module.exports = router;
