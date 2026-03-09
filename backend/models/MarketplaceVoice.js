const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 500 },
  created_at: { type: Date, default: Date.now },
})

// Royalty tiers: per-generation payout to the voice creator
const ROYALTY_TIERS = {
  standard: { rate: 50, display: '₹0.50' },    // ₹0.50 per generation (paise)
  premium:  { rate: 75, display: '₹0.75' },     // ₹0.75
  elite:    { rate: 100, display: '₹1.00' },     // ₹1.00
}

const marketplaceVoiceSchema = new mongoose.Schema({
  // Creator who uploaded the voice
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Source voice clone
  source_voice: { type: mongoose.Schema.Types.ObjectId, ref: 'Voice', required: true },

  // Display info
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 1000 },
  tags: [{ type: String, trim: true }],
  category: {
    type: String,
    enum: ['narration', 'cinematic', 'podcast', 'educational', 'meditation', 'news', 'storytelling', 'asmr', 'commercial', 'other'],
    default: 'narration',
  },
  language: { type: String, default: 'en' },
  gender: { type: String, enum: ['male', 'female', 'neutral'], default: 'neutral' },
  preview_url: { type: String, default: '' },

  // Quality gate — VoiceSampleCleaner score must be >= 80 to publish
  quality_score: { type: Number, required: true, min: 0, max: 100 },

  // Marketplace status
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'rejected', 'suspended'],
    default: 'draft',
  },

  // Consent
  consent: {
    is_own_voice: { type: Boolean, default: false },
    allows_commercial: { type: Boolean, default: false },
    allows_modification: { type: Boolean, default: true },
    consent_date: { type: Date },
  },

  // Pricing
  royalty_tier: { type: String, enum: Object.keys(ROYALTY_TIERS), default: 'standard' },
  is_free: { type: Boolean, default: false },

  // Stats
  total_uses: { type: Number, default: 0 },
  total_downloads: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },  // in paise

  // Ratings
  reviews: [reviewSchema],
  average_rating: { type: Number, default: 0, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },

  // Flags
  is_featured: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },  // staff verified

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

marketplaceVoiceSchema.pre('save', function (next) {
  this.updated_at = new Date()
  // Recalculate average rating
  if (this.reviews.length > 0) {
    this.average_rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length
    this.review_count = this.reviews.length
  }
  next()
})

marketplaceVoiceSchema.index({ status: 1, average_rating: -1 })
marketplaceVoiceSchema.index({ category: 1, status: 1 })
marketplaceVoiceSchema.index({ creator: 1 })
marketplaceVoiceSchema.index({ tags: 1 })

marketplaceVoiceSchema.statics.ROYALTY_TIERS = ROYALTY_TIERS
marketplaceVoiceSchema.statics.MIN_QUALITY_SCORE = 80

module.exports = mongoose.model('MarketplaceVoice', marketplaceVoiceSchema)
