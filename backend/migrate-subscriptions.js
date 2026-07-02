require('dotenv').config()
const pool = require('./src/db/db')

/*
 * Suscripciones: el corazón del modelo de negocio.
 * Una empresa tiene UNA suscripción, con un plan, un estado y una fecha
 * de vencimiento (current_period_end). La vigencia real se deriva:
 * si status es trial/active pero current_period_end ya pasó → expirada.
 *
 * Correr una sola vez:  node migrate-subscriptions.js
 */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      status VARCHAR(20) NOT NULL DEFAULT 'trial',  -- trial | active | cancelled
      current_period_end TIMESTAMPTZ NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cancelled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON subscriptions(company_id);
  `)
  console.log('✓ Tabla subscriptions lista')
  process.exit()
}

migrate().catch((e) => {
  console.error('Error en la migración:', e.message)
  process.exit(1)
})