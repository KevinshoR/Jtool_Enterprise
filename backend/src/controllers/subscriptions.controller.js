const pool = require('../db/db')

const TRIAL_DAYS = 14

/* ═══════════════════════════════════════════════════════════
   Suscripciones — lado del cliente.
   - POST /api/onboarding    → crea empresa + suscripción (trial 14 días)
   - GET  /api/me/overview   → empresa, plan, suscripción y productos reales
═══════════════════════════════════════════════════════════ */

/* Deriva el estado real: trial/active vencidos cuentan como 'expired' */
function effectiveStatus(sub) {
  if (!sub) return null
  const vigente = new Date(sub.current_period_end) > new Date()
  if ((sub.status === 'trial' || sub.status === 'active') && !vigente) return 'expired'
  if (sub.status === 'cancelled' && !vigente) return 'expired'
  return sub.status
}

function daysLeft(sub) {
  if (!sub) return 0
  const ms = new Date(sub.current_period_end) - new Date()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

/* Activa en company_products los productos que incluye el plan */
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
 * Onboarding: el usuario recién registrado crea su empresa y elige plan.
 * Todo en una transacción: si algo falla, no queda nada a medias.
 */
async function onboarding(req, res) {
  const { companyName, nit, phone, planId, productIds } = req.body
  const userId = req.user.id

  if (!companyName || companyName.trim().length < 2) {
    return res.status(400).json({ message: 'El nombre de la empresa es requerido (mínimo 2 caracteres)' })
  }
  if (!planId) {
    return res.status(400).json({ message: 'Debes elegir un plan' })
  }

  const client = await pool.connect()
  try {
    // ¿El usuario ya tiene empresa?
    const userRow = await client.query('SELECT company_id, email FROM users WHERE id = $1', [userId])
    if (!userRow.rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' })
    if (userRow.rows[0].company_id) {
      return res.status(409).json({ message: 'Ya tienes una empresa registrada' })
    }

    // ¿El plan existe?
    const planRow = await client.query('SELECT id, max_products FROM plans WHERE id = $1', [planId])
    if (planRow.rows.length === 0) {
      return res.status(400).json({ message: 'El plan seleccionado no existe' })
    }
    const plan = planRow.rows[0]

    // ¿El plan trae productos fijos (empresarial) o el usuario debe elegir?
    const planProductsRow = await client.query('SELECT product_id FROM plan_products WHERE plan_id = $1', [planId])
    const hasFixedProducts = planProductsRow.rows.length > 0

    let chosenProductIds = []
    if (!hasFixedProducts) {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: 'Debes elegir al menos un programa para este plan' })
      }
      if (productIds.length > plan.max_products) {
        return res.status(400).json({ message: `Este plan permite elegir hasta ${plan.max_products} programa(s)` })
      }
      const uniqueIds = [...new Set(productIds)]
      if (uniqueIds.length !== productIds.length) {
        return res.status(400).json({ message: 'No repitas el mismo programa' })
      }
      const validProducts = await client.query('SELECT id FROM products WHERE id = ANY($1::int[])', [uniqueIds])
      if (validProducts.rows.length !== uniqueIds.length) {
        return res.status(400).json({ message: 'Uno o más programas elegidos no son válidos' })
      }
      chosenProductIds = uniqueIds
    }

    await client.query('BEGIN')

    const company = (
      await client.query(
        `INSERT INTO companies (name, nit, phone, email, status, plan_id)
         VALUES ($1, $2, $3, $4, 'trial', $5) RETURNING *`,
        [companyName.trim(), nit?.trim() || null, phone?.trim() || null, userRow.rows[0].email, planId]
      )
    ).rows[0]

    await client.query('UPDATE users SET company_id = $1 WHERE id = $2', [company.id, userId])

    const subscription = (
      await client.query(
        `INSERT INTO subscriptions (company_id, plan_id, status, current_period_end)
         VALUES ($1, $2, 'trial', NOW() + INTERVAL '${TRIAL_DAYS} days') RETURNING *`,
        [company.id, planId]
      )
    ).rows[0]

    if (hasFixedProducts) {
      await syncPlanProducts(client, company.id, planId)
    } else {
      for (const productId of chosenProductIds) {
        await client.query(
          `INSERT INTO company_products (company_id, product_id, status, source)
           VALUES ($1, $2, 'active', 'plan')
           ON CONFLICT (company_id, product_id)
           DO UPDATE SET status = 'active', source = 'plan'`,
          [company.id, productId]
        )
      }
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: `Empresa creada. Tienes ${TRIAL_DAYS} días de prueba gratis`,
      company,
      subscription,
    })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Onboarding error:', error)
    res.status(500).json({ message: 'No pudimos crear tu empresa. Intenta de nuevo.' })
  } finally {
    client.release()
  }
}

/*
 * Overview del cliente: todo lo que el dashboard necesita en una llamada.
 */
async function getOverview(req, res) {
  try {
    const userRow = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.id])
    const companyId = userRow.rows[0]?.company_id

    if (!companyId) {
      return res.json({ company: null, subscription: null, plan: null, products: [] })
    }

    const [companyQ, subQ, productsQ] = await Promise.all([
      pool.query('SELECT id, name, nit, phone, status, created_at FROM companies WHERE id = $1', [companyId]),
      pool.query(
        `SELECT s.*, p.name AS plan_name, p.code AS plan_code, p.price_monthly
         FROM subscriptions s JOIN plans p ON p.id = s.plan_id
         WHERE s.company_id = $1`,
        [companyId]
      ),
      pool.query(
        `SELECT pr.id, pr.code, pr.name, pr.description, pr.tagline,
                cp.status AS access_status, cp.source
         FROM products pr
         LEFT JOIN company_products cp
           ON cp.product_id = pr.id AND cp.company_id = $1
         ORDER BY pr.name`,
        [companyId]
      ),
    ])

    const sub = subQ.rows[0] || null
    const estado = effectiveStatus(sub)
    const vigente = estado === 'trial' || estado === 'active' ||
      (sub?.status === 'cancelled' && new Date(sub.current_period_end) > new Date())

    const products = productsQ.rows.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      tagline: p.tagline,
      // Acceso real: el producto está asignado Y la suscripción está vigente
      has_access: p.access_status === 'active' && vigente,
      source: p.source,
    }))

    res.json({
      company: companyQ.rows[0],
      subscription: sub
        ? {
            status: estado,
            raw_status: sub.status,
            plan_name: sub.plan_name,
            plan_code: sub.plan_code,
            price_monthly: sub.price_monthly,
            current_period_end: sub.current_period_end,
            days_left: daysLeft(sub),
            started_at: sub.started_at,
          }
        : null,
      products,
    })
  } catch (error) {
    console.error('Overview error:', error)
    res.status(500).json({ message: 'Error obteniendo tu información' })
  }
}

module.exports = { onboarding, getOverview, effectiveStatus }