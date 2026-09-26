const express = require('express');
const router = express.Router();
const otaPackageController = require('../controllers/otaPackageController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, otaPackageController.getOtaPackages);
router.post('/', optionalAuth, otaPackageController.createOtaPackage);
router.delete('/:id', optionalAuth, otaPackageController.deleteOtaPackage);

module.exports = router;
