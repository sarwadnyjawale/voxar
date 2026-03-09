const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { generate } = require('../controllers/ttsController')

router.post('/generate', authMiddleware, generate)

module.exports = router
