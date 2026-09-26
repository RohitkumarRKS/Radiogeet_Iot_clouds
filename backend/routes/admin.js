const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

// All admin routes require SYS_ADMIN role
router.use(auth, requireRole('SYS_ADMIN'));

// Tenant management
router.get('/tenants', adminController.getAllTenants);
router.get('/tenants/:id', adminController.getTenantById);
router.post('/tenants', adminController.createTenant);
router.put('/tenants/:id', adminController.updateTenant);
router.delete('/tenants/:id', adminController.deleteTenant);

// User management (all users across all tenants)
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// All dashboards
router.get('/dashboards', adminController.getAllDashboards);

// Platform statistics
router.get('/stats', adminController.getStats);
router.post('/clean-demo-data', adminController.cleanDemoData);

module.exports = router;
