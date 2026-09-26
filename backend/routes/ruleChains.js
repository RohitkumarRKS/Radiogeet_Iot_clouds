const express = require('express');
const router = express.Router();
const ruleChainController = require('../controllers/ruleChainController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', ruleChainController.getAll);
router.get('/:id', ruleChainController.getById);
router.post('/', ruleChainController.create);
router.put('/:id', ruleChainController.update);
router.delete('/:id', ruleChainController.delete);
router.post('/:id/setRoot', ruleChainController.setRoot);

module.exports = router;
