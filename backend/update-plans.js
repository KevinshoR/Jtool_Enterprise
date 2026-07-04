require('dotenv').config()
const pool = require('./src/db/db')

const PLAN_UPDATES = [
  {
    code: 'basica',
    price_monthly: 54900,
    price_annual: 549000,
    max_products: 1,
    description: 'Para empezar a organizar tu negocio',
    features: [
      '1 programa a tu elección',
      'Todas las funciones del programa',
      'Soporte por WhatsApp y correo',
      'Copias de seguridad automáticas',
    ],
  },
  {
    code: 'pro',
    price_monthly: 99900,
    price_annual: 999000,
    max_products: 3,
    description: 'El favorito: más programas y más ventajas',
    features: [
      'Hasta 3 programas a tu elección',
      'Soporte prioritario (respuesta en menos de 4 horas hábiles)',
      'Reportes avanzados de tu negocio',
      'Recordatorios automáticos por correo a tus clientes',
      'Copias de seguridad automáticas',
    ],
  },
  {
    code: 'empresarial',
    price_monthly: 249900,
    price_annual: 2490000,
    max_products: 99,
    description: 'Todo incluido y a tu medida. Precio desde — cotizamos según tu necesidad',
    features: [
      'Todos los programas, actuales y futuros',
      'Asesor dedicado',
      'Personalización con tu marca',
      'Capacitación a tu equipo',
      'Desarrollo de funcionalidades a la medida',
    ],
  },
]

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_products INTEGER NOT NULL DEFAULT 1`)
    await client.query(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'`)

    for (const plan of PLAN_UPDATES) {
      const result = await client.query(
        `UPDATE plans SET
          price_monthly = $1,
          price_annual = $2,
          max_products = $3,
          description = $4,
          features = $5::jsonb
         WHERE code = $6
         RETURNING *`,
        [
          plan.price_monthly,
          plan.price_annual,
          plan.max_products,
          plan.description,
          JSON.stringify(plan.features),
          plan.code,
        ]
      )
      if (result.rows.length === 0) {
        throw new Error(`No existe el plan con code='${plan.code}'`)
      }
      console.log(`✔ Plan actualizado: ${plan.code}`, result.rows[0])
    }

    // plan_products: solo empresarial conserva filas (todos los productos).
    const empresarialQ = await client.query(`SELECT id FROM plans WHERE code = 'empresarial'`)
    const basicaQ = await client.query(`SELECT id FROM plans WHERE code = 'basica'`)
    const proQ = await client.query(`SELECT id FROM plans WHERE code = 'pro'`)

    const empresarialId = empresarialQ.rows[0]?.id
    const basicaId = basicaQ.rows[0]?.id
    const proId = proQ.rows[0]?.id

    if (basicaId) {
      await client.query(`DELETE FROM plan_products WHERE plan_id = $1`, [basicaId])
    }
    if (proId) {
      await client.query(`DELETE FROM plan_products WHERE plan_id = $1`, [proId])
    }
    if (empresarialId) {
      await client.query(`DELETE FROM plan_products WHERE plan_id = $1`, [empresarialId])
      await client.query(
        `INSERT INTO plan_products (plan_id, product_id)
         SELECT $1, id FROM products
         ON CONFLICT (plan_id, product_id) DO NOTHING`,
        [empresarialId]
      )
    }

    await client.query('COMMIT')

    const finalPlans = await client.query(`SELECT * FROM plans ORDER BY sort_order`)
    const finalPlanProducts = await client.query(`
      SELECT pp.plan_id, pl.code AS plan_code, pr.code AS product_code
      FROM plan_products pp
      JOIN plans pl ON pl.id = pp.plan_id
      JOIN products pr ON pr.id = pp.product_id
      ORDER BY pl.sort_order, pr.code
    `)

    console.log('\n=== Planes finales ===')
    console.table(finalPlans.rows.map((p) => ({
      code: p.code,
      price_monthly: p.price_monthly,
      price_annual: p.price_annual,
      max_products: p.max_products,
      features: JSON.stringify(p.features),
    })))

    console.log('\n=== plan_products finales ===')
    console.table(finalPlanProducts.rows)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Error en la migración de planes:', error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

run()
