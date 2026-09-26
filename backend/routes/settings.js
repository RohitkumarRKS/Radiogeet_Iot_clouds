const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', settingsController.getSettings);
router.put('/:category', settingsController.updateCategory);
router.post('/mail/test', settingsController.sendTestEmail);
router.post('/billing/upgrade', settingsController.upgradePlan);

module.exports = router;
