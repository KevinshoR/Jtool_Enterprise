const pool = require('../db/db')

/*
 * Catálogo público. Devuelve category, status y target_audience para
 * que el frontend arme filtros por tipo de negocio de forma escalable.
 * Soporta ?category= y ?search= opcionales (filtrado también en servidor).
 */
async function getPublicProducts(req, res) {
  const { category, search } = req.query
  try {
    const cond = []
    const params = []
    if (category && category !== 'todos') {
      params.push(category)
      cond.push(`category = $${params.length}`)
    }
    if (search) {
      params.push(`%${search}%`)
      cond.push(`(name ILIKE $${params.length} OR tagline ILIKE $${params.length} OR target_audience ILIKE $${params.length})`)
    }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : ''
    const result = await pool.query(
      `SELECT id, code, name, description, tagline, accent, category, target_audience, status
       FROM products ${where}
       ORDER BY sort_order, name`,
      params
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo productos' })
  }
}

/* Lista de categorías con conteo, para pintar los filtros dinámicamente */
async function getCategories(req, res) {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*)::int AS count
       FROM products WHERE category IS NOT NULL
       GROUP BY category ORDER BY category`
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo categorías' })
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

module.exports = { getPublicProducts, getCategories, getPublicProductByCode }