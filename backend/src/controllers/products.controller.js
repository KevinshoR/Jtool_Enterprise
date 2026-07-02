const pool = require('../db/db')

async function getPublicProducts(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, code, name, description, tagline, accent FROM products ORDER BY name'
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo productos' })
  }
}

async function getPublicProductByCode(req, res) {
  const { code } = req.params
  try {
    const result = await pool.query('SELECT * FROM products WHERE code = $1', [code])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Programa no encontrado' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo el programa' })
  }
}

module.exports = { getPublicProducts, getPublicProductByCode }