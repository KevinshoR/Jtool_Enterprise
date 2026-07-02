const express = require('express')
const router = express.Router()
const { getPublicProducts, getPublicProductByCode } = require('../controllers/products.controller')

router.get('/', getPublicProducts)
router.get('/:code', getPublicProductByCode)

module.exports = router