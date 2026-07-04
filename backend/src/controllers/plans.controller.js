const pool = require('../db/db')

// Público — usado en la landing (/productos y /precios), no requiere login
async function getPublicPlans(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        p.id, p.code, p.name, p.description, p.price_monthly, p.price_annual,
        p.is_featured, p.sort_order, p.max_products, p.features,
        COALESCE(
          json_agg(
            json_build_object('id', pr.id, 'code', pr.code, 'name', pr.name, 'description', pr.description)
          ) FILTER (WHERE pr.id IS NOT NULL),
          '[]'
        ) AS products
      FROM plans p
      LEFT JOIN plan_products pp ON pp.plan_id = p.id
      LEFT JOIN products pr ON pr.id = pp.product_id
      GROUP BY p.id
      ORDER BY p.sort_order
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error obteniendo planes' })
  }
}

// Admin — CRUD de planes
async function createPlan(req, res) {
  const { code, name, description, price_monthly, price_annual, is_featured, sort_order } = req.body
  if (!code || !name || !price_monthly) {
    return res.status(400).json({ message: 'code, name y price_monthly son requeridos' })
  }
  try {
    const result = await pool.query(
      `INSERT INTO plans (code, name, description, price_monthly, price_annual, is_featured, sort_order)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, false), COALESCE($7, 0))
       RETURNING *`,
      [code, name, description || null, price_monthly, price_annual || null, is_featured, sort_order]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    if (error.code === '23505') return res.status(409).json({ message: 'Ya existe un plan con ese código' })
    res.status(500).json({ message: 'Error creando plan' })
  }
}

async function updatePlan(req, res) {
  const { id } = req.params
  const { name, description, price_monthly, price_annual, is_featured, sort_order } = req.body
  try {
    const result = await pool.query(
      `UPDATE plans SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price_monthly = COALESCE($3, price_monthly),
        price_annual = COALESCE($4, price_annual),
        is_featured = COALESCE($5, is_featured),
        sort_order = COALESCE($6, sort_order)
       WHERE id = $7
       RETURNING *`,
      [name, description, price_monthly, price_annual, is_featured, sort_order, id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan no encontrado' })
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error actualizando plan' })
  }
}

// Asigna qué productos incluye un plan (reemplaza la lista completa)
async function setPlanProducts(req, res) {
  const { id } = req.params
  const { product_ids } = req.body // array de IDs
  if (!Array.isArray(product_ids)) {
    return res.status(400).json({ message: 'product_ids debe ser un arreglo' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM plan_products WHERE plan_id = $1', [id])
    for (const productId of product_ids) {
      await client.query(
        'INSERT INTO plan_products (plan_id, product_id) VALUES ($1, $2)',
        [id, productId]
      )
    }
    await client.query('COMMIT')
    res.json({ message: 'Productos del plan actualizados' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ message: 'Error actualizando productos del plan' })
  } finally {
    client.release()
  }
}

// Asigna un plan a una empresa: activa automáticamente todos los productos del plan
async function assignPlanToCompany(req, res) {
  const { companyId } = req.params
  const { plan_id } = req.body
  if (!plan_id) return res.status(400).json({ message: 'plan_id es requerido' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query('UPDATE companies SET plan_id = $1 WHERE id = $2', [plan_id, companyId])

    const planProducts = await client.query(
      'SELECT product_id FROM plan_products WHERE plan_id = $1',
      [plan_id]
    )

    for (const row of planProducts.rows) {
      await client.query(
        `INSERT INTO company_products (company_id, product_id, status, source)
         VALUES ($1, $2, 'active', 'plan')
         ON CONFLICT (company_id, product_id)
         DO UPDATE SET status = 'active', source = 'plan'`,
        [companyId, row.product_id]
      )
    }

    await client.query('COMMIT')
    res.json({ message: 'Plan asignado y productos activados' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ message: 'Error asignando plan' })
  } finally {
    client.release()
  }
}

module.exports = {
  getPublicPlans,
  createPlan,
  updatePlan,
  setPlanProducts,
  assignPlanToCompany,
}