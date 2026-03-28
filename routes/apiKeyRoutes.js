const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, apiKeyController.generateKey);
router.get('/', authMiddleware, apiKeyController.listKeys);
router.put('/revoke/:id', authMiddleware, apiKeyController.revokeKey);
router.get('/stats', authMiddleware, apiKeyController.getKeyStats);

module.exports = router;