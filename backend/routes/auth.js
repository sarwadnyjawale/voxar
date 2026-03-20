const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { register, login, getMe, updateProfile, verifyEmail, resendVerification } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)
router.patch('/me', authMiddleware, updateProfile)
router.post('/verify-email', authMiddleware, verifyEmail)
router.post('/resend-verification', authMiddleware, resendVerification)

module.exports = router
