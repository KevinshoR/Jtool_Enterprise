const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth.middleware')
const isAdmin = require('../middleware/admin.middleware')
const {
  getStats,
  getUsers,
  getCompanies,
  createCompany,
  getProducts,
  assignProduct,
  manageSubscription,
} = require('../controllers/admin.controller')

router.use(verifyToken, isAdmin)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.get('/companies', getCompanies)
router.post('/companies', createCompany)
router.get('/products', getProducts)
router.post('/companies/:id/products', assignProduct)
router.patch('/companies/:id/subscription', manageSubscription)

module.exports = router