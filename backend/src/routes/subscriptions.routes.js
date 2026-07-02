const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth.middleware')
const { onboarding, getOverview } = require('../controllers/subscriptions.controller')

router.post('/onboarding', verifyToken, onboarding)
router.get('/me/overview', verifyToken, getOverview)

module.exports = router