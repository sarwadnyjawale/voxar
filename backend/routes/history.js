const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const { getHistory, getHistoryItem, deleteHistoryItem } = require('../controllers/historyController')

router.get('/', authMiddleware, getHistory)
router.get('/:id', authMiddleware, getHistoryItem)
router.delete('/:id', authMiddleware, deleteHistoryItem)

module.exports = router
