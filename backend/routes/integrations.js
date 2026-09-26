const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, integrationController.getIntegrations);
router.post('/', optionalAuth, integrationController.createIntegration);
router.delete('/:id', optionalAuth, integrationController.deleteIntegration);

module.exports = router;
