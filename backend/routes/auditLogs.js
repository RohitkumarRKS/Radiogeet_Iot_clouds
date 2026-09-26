const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/', auditLogController.getAll);

module.exports = router;
