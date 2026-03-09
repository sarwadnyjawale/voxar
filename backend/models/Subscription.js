const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Razorpay identifiers
  razorpay_subscription_id: { type: String, required: true, unique: true },
  razorpay_plan_id: { type: String, required: true },
  razorpay_customer_id: { type: String, default: '' },

  // Plan details
  plan: { type: String, enum: ['access', 'starter', 'creator', 'pro'], required: true },
  billing_period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },

  // Pricing (in paise)
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  // Status
  status: {
    type: String,
    enum: ['created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired'],
    default: 'created',
  },

  // Dates
  current_start: { type: Date },
  current_end: { type: Date },
  ended_at: { type: Date },
  charge_at: { type: Date },

  // Metadata
  total_count: { type: Number, default: 0 },  // total billing cycles
  paid_count: { type: Number, default: 0 },    // completed billing cycles
  remaining_count: { type: Number },
  short_url: { type: String, default: '' },     // Razorpay payment link

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

subscriptionSchema.pre('save', function (next) {
  this.updated_at = new Date()
  next()
})

subscriptionSchema.index({ razorpay_subscription_id: 1 })

module.exports = mongoose.model('Subscription', subscriptionSchema)
