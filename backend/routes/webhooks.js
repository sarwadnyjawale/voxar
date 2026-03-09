const express = require('express')
const router = express.Router()
const { handleWebhook } = require('../controllers/webhookController')

// Razorpay webhook — uses raw body for signature verification
// The raw body middleware is applied in server.js
router.post('/razorpay', handleWebhook)

module.exports = router
