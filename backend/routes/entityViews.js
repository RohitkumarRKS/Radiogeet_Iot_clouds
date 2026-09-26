const express = require('express');
const router = express.Router();
const entityViewController = require('../controllers/entityViewController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, entityViewController.getEntityViews);
router.post('/', optionalAuth, entityViewController.createEntityView);
router.delete('/:id', optionalAuth, entityViewController.deleteEntityView);

module.exports = router;
