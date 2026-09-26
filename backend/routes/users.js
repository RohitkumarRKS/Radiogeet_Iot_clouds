const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireRole('SYS_ADMIN', 'TENANT_ADMIN'), userController.createUser);
router.put('/:id', requireRole('SYS_ADMIN', 'TENANT_ADMIN'), userController.updateUser);
router.delete('/:id', requireRole('SYS_ADMIN', 'TENANT_ADMIN'), userController.deleteUser);

module.exports = router;
