const express = require('express');
const router = express.Router();
const alarmController = require('../controllers/alarmController');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, alarmController.getAll);
router.get('/entity/:entityId', optionalAuth, alarmController.getByEntity);
router.get('/:id', optionalAuth, alarmController.getById);
router.put('/:id/ack', auth, alarmController.acknowledge);
router.put('/:id/clear', auth, alarmController.clear);
router.delete('/:id', auth, alarmController.delete);

module.exports = router;
