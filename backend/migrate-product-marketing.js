const fs = require('fs')
const path = require('path')
const pool = require('./src/db/db')

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'src/migrations/product_marketing_schema.sql'), 'utf8')
  await pool.query(sql)
  console.log('Contenido de marketing agregado a productos ✓')
  process.exit()
}

migrate().catch((err) => {
  console.error('Error en migración:', err)
  process.exit(1)
})