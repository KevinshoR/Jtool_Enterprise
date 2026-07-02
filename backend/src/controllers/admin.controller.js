const pool = require('../db/db')

async function getStats(req, res) {
  try {
    const [users, companies, activeSubs, products] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM companies'),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM subscriptions
         WHERE status IN ('trial','active') AND current_period_end > NOW()`
      ),
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
        s.id AS subscription_id,
        s.status AS subscription_status,
        s.current_period_end,
        pl.id AS plan_id,
        pl.name AS plan_name,
        pl.price_monthly,
        (s.id IS NOT NULL AND s.current_period_end > NOW()) AS subscription_vigente,
        COALESCE(
          json_agg(
            json_build_object('id', p.id, 'name', p.name, 'code', p.code, 'status', cp.status, 'source', cp.source)
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS products
      FROM companies c
      LEFT JOIN subscriptions s ON s.company_id = c.id
      LEFT JOIN plans pl ON pl.id = s.plan_id
      LEFT JOIN company_products cp ON cp.company_id = c.id
      LEFT JOIN products p ON p.id = cp.product_id
      GROUP BY c.id, s.id, pl.id
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
      `INSERT INTO company_products (company_id, product_id, status, source)
       VALUES ($1, $2, COALESCE($3, 'active'), 'individual')
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

/* Activa en company_products los productos del plan */
async function syncPlanProducts(client, companyId, planId) {
  await client.query(
    `DELETE FROM company_products
     WHERE company_id = $1 AND source = 'plan'
       AND product_id NOT IN (SELECT product_id FROM plan_products WHERE plan_id = $2)`,
    [companyId, planId]
  )
  await client.query(
    `INSERT INTO company_products (company_id, product_id, status, source)
     SELECT $1, product_id, 'active', 'plan' FROM plan_products WHERE plan_id = $2
     ON CONFLICT (company_id, product_id)
     DO UPDATE SET status = 'active', source = 'plan'`,
    [companyId, planId]
  )
}

/*
 * Gestión de la suscripción de una empresa (cuando el cliente paga, tú activas).
 * PATCH /api/admin/companies/:id/subscription
 * body: { action: 'activate_month' | 'cancel', plan_id? }
 *
 * - activate_month: marca 'active' y extiende el vencimiento 1 mes.
 *   · Si el período aún no vence, el mes se SUMA al final (no se pierde tiempo pagado).
 *   · Si la empresa no tenía suscripción, se crea (requiere plan_id).
 *   · plan_id opcional para cambiar de plan al activar.
 * - cancel: marca 'cancelled'. El acceso dura hasta el fin del período ya pagado.
 */
async function manageSubscription(req, res) {
  const { id } = req.params
  const { action, plan_id } = req.body

  if (!['activate_month', 'cancel'].includes(action)) {
    return res.status(400).json({ message: "action debe ser 'activate_month' o 'cancel'" })
  }

  const client = await pool.connect()
  try {
    const companyQ = await client.query('SELECT id FROM companies WHERE id = $1', [id])
    if (companyQ.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    const subQ = await client.query('SELECT * FROM subscriptions WHERE company_id = $1', [id])
    const sub = subQ.rows[0]

    await client.query('BEGIN')

    let result

    if (action === 'cancel') {
      if (!sub) {
        await client.query('ROLLBACK')
        return res.status(404).json({ message: 'La empresa no tiene suscripción' })
      }
      result = (
        await client.query(
          `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW()
           WHERE company_id = $1 RETURNING *`,
          [id]
        )
      ).rows[0]
      await client.query(`UPDATE companies SET status = 'inactive' WHERE id = $1`, [id])
    } else {
      // activate_month
      const targetPlan = plan_id || sub?.plan_id
      if (!targetPlan) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'La empresa no tiene plan: envía plan_id para crear la suscripción' })
      }
      const planQ = await client.query('SELECT id FROM plans WHERE id = $1', [targetPlan])
      if (planQ.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: 'El plan no existe' })
      }

      if (!sub) {
        result = (
          await client.query(
            `INSERT INTO subscriptions (company_id, plan_id, status, current_period_end)
             VALUES ($1, $2, 'active', NOW() + INTERVAL '1 month') RETURNING *`,
            [id, targetPlan]
          )
        ).rows[0]
      } else {
        result = (
          await client.query(
            `UPDATE subscriptions
             SET status = 'active',
                 plan_id = $2,
                 cancelled_at = NULL,
                 current_period_end = GREATEST(current_period_end, NOW()) + INTERVAL '1 month'
             WHERE company_id = $1 RETURNING *`,
            [id, targetPlan]
          )
        ).rows[0]
      }

      await client.query(`UPDATE companies SET status = 'active', plan_id = $2 WHERE id = $1`, [id, targetPlan])
      await syncPlanProducts(client, id, targetPlan)
    }

    await client.query('COMMIT')
    res.json({ message: action === 'cancel' ? 'Suscripción cancelada' : 'Mes activado', subscription: result })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Manage subscription error:', error)
    res.status(500).json({ message: 'Error gestionando la suscripción' })
  } finally {
    client.release()
  }
}

module.exports = {
  getStats,
  getUsers,
  getCompanies,
  createCompany,
  getProducts,
  assignProduct,
  manageSubscription,
}