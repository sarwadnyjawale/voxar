const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { getUsage, createApiKey, deleteApiKey } = require('../controllers/usageController')

router.get('/usage', authMiddleware, getUsage)
router.post('/api-keys', authMiddleware, createApiKey)
router.delete('/api-keys/:keyId', authMiddleware, deleteApiKey)

module.exports = router
