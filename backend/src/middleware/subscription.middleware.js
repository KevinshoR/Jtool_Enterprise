const pool = require('../db/db')

/*
 * requireActiveSubscription — protege las rutas de los PRODUCTOS.
 *
 * Úsalo en los endpoints de los programas (cuando existan sus APIs):
 *   router.use(verifyToken, requireActiveSubscription)
 *
 * Deja pasar solo si la empresa del usuario tiene suscripción vigente
 * (trial o active sin vencer, o cancelada pero aún dentro del período pagado).
 */
async function requireActiveSubscription(req, res, next) {
  try {
    const userRow = await pool.query('SELECT company_id FROM users WHERE id = $1', [req.user.id])
    const companyId = userRow.rows[0]?.company_id
    if (!companyId) {
      return res.status(403).json({ message: 'Tu cuenta no tiene una empresa registrada', code: 'NO_COMPANY' })
    }

    const subRow = await pool.query('SELECT * FROM subscriptions WHERE company_id = $1', [companyId])
    const sub = subRow.rows[0]
    const vigente = sub && new Date(sub.current_period_end) > new Date()

    if (!vigente) {
      return res.status(403).json({
        message: 'Tu suscripción no está activa. Renuévala para seguir usando los programas.',
        code: 'SUBSCRIPTION_EXPIRED',
      })
    }

    req.companyId = companyId
    req.subscription = sub
    next()
  } catch (error) {
    console.error('Subscription middleware error:', error)
    res.status(500).json({ message: 'Error verificando la suscripción' })
  }
}

module.exports = requireActiveSubscription