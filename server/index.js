const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./src/db/db')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

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