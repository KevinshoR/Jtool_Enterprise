const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth.middleware')
const isAdmin = require('../middleware/admin.middleware')
const {
  getPublicPlans,
  createPlan,
  updatePlan,
  setPlanProducts,
  assignPlanToCompany,
} = require('../controllers/plans.controller')

// Público, sin token — lo consume la landing
router.get('/', getPublicPlans)

// Todo lo demás requiere ser admin
router.post('/', verifyToken, isAdmin, createPlan)
router.put('/:id', verifyToken, isAdmin, updatePlan)
router.put('/:id/products', verifyToken, isAdmin, setPlanProducts)
router.post('/companies/:companyId/assign', verifyToken, isAdmin, assignPlanToCompany)

module.exports = router