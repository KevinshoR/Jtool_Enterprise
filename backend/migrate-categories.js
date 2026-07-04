require('dotenv').config()
const pool = require('./src/db/db')

/*
 * Agrega categoría por TIPO DE NEGOCIO a los productos.
 * Escalable: agregar un programa nuevo = un INSERT con su category,
 * y aparece solo en el navbar, la página de productos y los filtros.
 *
 * Correr una vez:  node migrate-categories.js
 */

// Categorías fijas del navbar (pocas, estables). Los programas son muchos.
const CATEGORIAS = ['comercio', 'servicios', 'talleres', 'finanzas']

async function migrate() {
  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(30);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline VARCHAR(200);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS target_audience VARCHAR(200);
    ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 100;
  `)

  // Asigna categoría a los 3 actuales (idempotente)
  const updates = [
    ['jtools', 'comercio', 'Repuesteras y autopartes'],
    ['barberpro', 'servicios', 'Barberías y salones'],
    ['catalogapp', 'comercio', 'Tiendas y comercios'],
  ]
  for (const [code, category, audience] of updates) {
    await pool.query(
      `UPDATE products SET category = COALESCE(category, $2), target_audience = COALESCE(target_audience, $3) WHERE code = $1`,
      [code, category, audience]
    )
  }

  // Los que queden sin categoría → 'comercio' por defecto (nunca null)
  await pool.query(`UPDATE products SET category = 'comercio' WHERE category IS NULL`)
  await pool.query(`UPDATE products SET status = 'available' WHERE status IS NULL`)

  const { rows } = await pool.query('SELECT code, name, category, status FROM products ORDER BY category, name')
  console.log('✓ Categorías aplicadas. Estado actual:')
  console.table(rows)
  console.log('\nCategorías válidas para el navbar:', CATEGORIAS.join(', '))
  process.exit()
}

migrate().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
