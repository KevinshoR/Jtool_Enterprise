const fs = require('fs')
const path = require('path')
const pool = require('./src/db/db')

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'src/migrations/admin_schema.sql'), 'utf8')
  await pool.query(sql)
  console.log('Migración de admin aplicada ✓')
  process.exit()
}

migrate().catch((err) => {
  console.error('Error en migración:', err)
  process.exit(1)
})