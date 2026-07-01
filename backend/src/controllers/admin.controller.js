const pool = require('../db/db')

async function getStats(req, res) {
  try {
    const [users, companies, activeSubs, products] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM companies'),
      pool.query("SELECT COUNT(*)::int AS count FROM company_products WHERE status = 'active'"),
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
    ])
    res.json({
      totalUsers: users.rows[0].count,
      totalCompanies: companies.rows[0].count,
      activeSubscriptions: activeSubs.rows[0].count,
      totalProducts: products.rows[0].count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo estadísticas' })
  }
}

async function getUsers(req, res) {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             c.id AS company_id, c.name AS company_name
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      ORDER BY u.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo usuarios' })
  }
}

async function getCompanies(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        c.id, c.name, c.nit, c.email, c.phone, c.status, c.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'name', p.name, 'code', p.code, 'status', cp.status)
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS products
      FROM companies c
      LEFT JOIN company_products cp ON cp.company_id = c.id
      LEFT JOIN products p ON p.id = cp.product_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo empresas' })
  }
}

async function createCompany(req, res) {
  const { name, nit, email, phone, status } = req.body
  if (!name) return res.status(400).json({ message: 'El nombre de la empresa es requerido' })
  try {
    const result = await pool.query(
      `INSERT INTO companies (name, nit, email, phone, status)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'active'))
       RETURNING *`,
      [name, nit || null, email || null, phone || null, status || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error creando empresa' })
  }
}

async function getProducts(req, res) {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name')
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo productos' })
  }
}

async function assignProduct(req, res) {
  const { id } = req.params
  const { product_id, status } = req.body
  if (!product_id) return res.status(400).json({ message: 'product_id es requerido' })
  try {
    const result = await pool.query(
      `INSERT INTO company_products (company_id, product_id, status)
       VALUES ($1, $2, COALESCE($3, 'active'))
       ON CONFLICT (company_id, product_id)
       DO UPDATE SET status = EXCLUDED.status
       RETURNING *`,
      [id, product_id, status || null]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error asignando producto' })
  }
}

module.exports = { getStats, getUsers, getCompanies, createCompany, getProducts, assignProduct }