const express = require('express')
const router = express.Router()
const { authMiddleware, optionalAuth } = require('../middleware/auth')
const {
  browseVoices,
  getVoice,
  publishVoice,
  unpublishVoice,
  reviewVoice,
  getMyListings,
  getEarnings,
  requestPayout,
} = require('../controllers/marketplaceController')

// Public — browse marketplace
router.get('/voices', browseVoices)
router.get('/voices/:id', getVoice)

// Authenticated — creator actions
router.post('/publish', authMiddleware, publishVoice)
router.delete('/voices/:id', authMiddleware, unpublishVoice)
router.post('/voices/:id/review', authMiddleware, reviewVoice)

// Creator dashboard
router.get('/my-voices', authMiddleware, getMyListings)
router.get('/earnings', authMiddleware, getEarnings)
router.post('/payout', authMiddleware, requestPayout)

module.exports = router
