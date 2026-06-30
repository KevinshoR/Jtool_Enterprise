// ejecuta esto una vez en un archivo aparte, ej. backend/seed.js
const bcrypt = require('bcryptjs')
const pool = require('./src/db/db')

async function seed() {
  const hashedPassword = await bcrypt.hash('123456', 10)
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
    ['Kevin', 'kevin@jtool.com', hashedPassword, 'admin']
  )
  console.log('Usuario creado')
  process.exit()
}

seed()