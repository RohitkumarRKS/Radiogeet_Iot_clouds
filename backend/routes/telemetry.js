const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');

// Protected Admin endpoint to clear all historical telemetry data (requires authentication)
router.post('/clear-all', auth, requireRole('SYS_ADMIN', 'TENANT_ADMIN'), telemetryController.clearAllTelemetry);
router.delete('/clear-all', auth, requireRole('SYS_ADMIN', 'TENANT_ADMIN'), telemetryController.clearAllTelemetry);

// Public endpoint for devices to push telemetry (supports POST, GET, etc.)
router.all('/v1/:accessToken/telemetry', telemetryController.pushByAccessToken);

// Public endpoint for Industrial Gateways pushing sub-device telemetry
router.post('/v1/:accessToken/gateway/telemetry', telemetryController.pushGatewayTelemetry);
router.post('/v1/gateway/telemetry', telemetryController.pushGatewayTelemetry);

// Telemetry reading endpoints (support guest view)
router.get('/:entityId/latest', optionalAuth, telemetryController.getLatest);
router.get('/:entityId/timeseries', optionalAuth, telemetryController.getTimeSeries);
router.post('/:entityId', auth, telemetryController.pushTelemetry);

module.exports = router;
