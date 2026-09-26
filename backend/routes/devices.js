const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', deviceController.getAll);
router.get('/profiles', deviceController.getProfiles);
router.post('/profiles', deviceController.createProfile);
router.get('/:id', deviceController.getById);
router.post('/', deviceController.create);
router.put('/:id', deviceController.update);
router.delete('/:id', deviceController.delete);
router.get('/:id/credentials', deviceController.getCredentials);
router.post('/:id/credentials', deviceController.regenerateCredentials);
router.post('/:id/rpc', deviceController.sendRpc);

module.exports = router;
