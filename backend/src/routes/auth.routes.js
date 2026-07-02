const express = require('express')
const router = express.Router()
const { login, register, googleLogin, forgotPassword, resetPassword, me } = require('../controllers/auth.controller')
const verifyToken = require('../middleware/auth.middleware')

router.post('/login', login)
router.post('/register', register)
router.post('/google', googleLogin)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/me', verifyToken, me)

module.exports = router