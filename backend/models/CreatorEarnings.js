const mongoose = require('mongoose')

const earningEntrySchema = new mongoose.Schema({
  marketplace_voice: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceVoice', required: true },
  voice_name: { type: String, default: '' },
  uses: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },  // in paise
}, { _id: false })

const creatorEarningsSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Period tracking
  period: { type: String, required: true },  // 'YYYY-MM' format
  period_start: { type: Date, required: true },
  period_end: { type: Date, required: true },

  // Earnings breakdown by voice
  voice_earnings: [earningEntrySchema],

  // Totals for this period
  total_uses: { type: Number, default: 0 },
  total_earned: { type: Number, default: 0 },     // in paise (gross)
  platform_fee: { type: Number, default: 0 },      // 30% VOXAR cut (in paise)
  creator_payout: { type: Number, default: 0 },    // 70% to creator (in paise)

  // Payout status
  payout_status: {
    type: String,
    enum: ['pending', 'eligible', 'requested', 'processing', 'paid', 'failed'],
    default: 'pending',
  },

  // Payout details
  payout_method: { type: String, enum: ['credits', 'bank_transfer', 'none'], default: 'none' },
  payout_reference: { type: String, default: '' },     // UPI/bank ref
  payout_date: { type: Date },
  payout_fee: { type: Number, default: 0 },            // ₹10 flat fee for bank transfer (1000 paise)

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

creatorEarningsSchema.pre('save', function (next) {
  this.updated_at = new Date()

  // Calculate totals
  this.total_uses = this.voice_earnings.reduce((sum, e) => sum + e.uses, 0)
  this.total_earned = this.voice_earnings.reduce((sum, e) => sum + e.amount, 0)
  this.platform_fee = Math.floor(this.total_earned * 0.30)        // 30% VOXAR
  this.creator_payout = this.total_earned - this.platform_fee     // 70% creator

  // Mark eligible if meets minimum payout (₹200 = 20000 paise)
  if (this.payout_status === 'pending' && this.creator_payout >= 20000) {
    this.payout_status = 'eligible'
  }

  next()
})

creatorEarningsSchema.index({ creator: 1, period: 1 }, { unique: true })

// Minimum payout threshold: ₹200
creatorEarningsSchema.statics.MIN_PAYOUT = 20000   // in paise
// Bank transfer fee: ₹10
creatorEarningsSchema.statics.BANK_TRANSFER_FEE = 1000  // in paise
// Revenue split: 70% creator / 30% VOXAR
creatorEarningsSchema.statics.CREATOR_SHARE = 0.70
creatorEarningsSchema.statics.PLATFORM_SHARE = 0.30

module.exports = mongoose.model('CreatorEarnings', creatorEarningsSchema)
