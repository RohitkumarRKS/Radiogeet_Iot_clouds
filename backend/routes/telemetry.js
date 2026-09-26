const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { auth, optionalAuth } = require('../middleware/auth');

// Public & Admin endpoint to clear all historical telemetry data
router.post('/clear-all', optionalAuth, telemetryController.clearAllTelemetry);
router.delete('/clear-all', optionalAuth, telemetryController.clearAllTelemetry);

// Public endpoint for devices to push telemetry (supports POST, GET, etc.)
router.all('/v1/:accessToken/telemetry', telemetryController.pushByAccessToken);

// Telemetry reading endpoints (support guest view)
router.get('/:entityId/latest', optionalAuth, telemetryController.getLatest);
router.get('/:entityId/timeseries', optionalAuth, telemetryController.getTimeSeries);
router.post('/:entityId', auth, telemetryController.pushTelemetry);

module.exports = router;
