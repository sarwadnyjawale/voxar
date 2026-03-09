const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },

  // Razorpay identifiers
  razorpay_payment_id: { type: String, required: true, unique: true },
  razorpay_order_id: { type: String, default: '' },
  razorpay_subscription_id: { type: String, default: '' },
  razorpay_invoice_id: { type: String, default: '' },

  // Payment details
  amount: { type: Number, required: true },       // in paise
  currency: { type: String, default: 'INR' },
  plan: { type: String, default: '' },
  billing_period: { type: String, default: '' },

  // Status
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created',
  },
  method: { type: String, default: '' },           // card, upi, netbanking, wallet
  description: { type: String, default: '' },
  error_code: { type: String, default: '' },
  error_description: { type: String, default: '' },

  // Receipt
  receipt: { type: String, default: '' },
  invoice_url: { type: String, default: '' },

  created_at: { type: Date, default: Date.now },
})

paymentSchema.index({ user: 1, created_at: -1 })

module.exports = mongoose.model('Payment', paymentSchema)
