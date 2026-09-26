const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', gatewayController.getAll);
router.get('/:id', gatewayController.getById);
router.post('/', gatewayController.create);
router.put('/:id', gatewayController.update);
router.delete('/:id', gatewayController.delete);
router.get('/:id/logs', gatewayController.getLogs);
router.get('/:id/stats', gatewayController.getStats);
router.post('/:id/credentials', gatewayController.regenerateCredentials);

module.exports = router;
