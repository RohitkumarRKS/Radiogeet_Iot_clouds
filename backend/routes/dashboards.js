const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, dashboardController.getAll);
router.get('/:id', optionalAuth, dashboardController.getById);
router.post('/', auth, dashboardController.create);
router.put('/:id', auth, dashboardController.update);
router.delete('/:id', auth, dashboardController.delete);
router.post('/:dashboardId/assign', auth, dashboardController.assignToCustomer);

module.exports = router;

