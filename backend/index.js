const express = require('express')
const plansRoutes = require('./src/routes/plans.routes')   // ← nuevo
const cors = require('cors')
const adminRoutes = require('./src/routes/admin.routes') 
require('dotenv').config()
const productsRoutes = require('./src/routes/products.routes')
const pool = require('./src/db/db')
const authRoutes = require('./src/routes/auth.routes')   // ← nuevo

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)   // ← nuevo
app.use('/api/admin', adminRoutes) 
app.use('/api/plans', plansRoutes)
app.use('/api/products', productsRoutes) 

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ message: 'Servidor corriendo y BD conectada ✓' })
  } catch (error) {
    res.status(500).json({ message: 'Error conectando a la BD', error })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})