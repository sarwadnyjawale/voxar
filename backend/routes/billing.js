const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const {
  getPlans,
  subscribe,
  verifyPayment,
  getSubscription,
  cancelCurrentSubscription,
  getPayments,
} = require('../controllers/billingController')

// Public — anyone can view plans
router.get('/plans', getPlans)

// Authenticated — subscription management
router.post('/subscribe', authMiddleware, subscribe)
router.post('/verify', authMiddleware, verifyPayment)
router.get('/subscription', authMiddleware, getSubscription)
router.post('/cancel', authMiddleware, cancelCurrentSubscription)
router.get('/payments', authMiddleware, getPayments)

module.exports = router
