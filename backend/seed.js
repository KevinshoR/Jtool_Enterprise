require('dotenv').config()

const bcrypt = require('bcryptjs')
const pool = require('./src/db/db')

function isPasswordValid(password) {
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial
}

async function seed() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar definidos en el .env')
    process.exit(1)
  }

  if (!isPasswordValid(ADMIN_PASSWORD)) {
    console.error(
      'ADMIN_PASSWORD debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial'
    )
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_NAME || 'Admin', ADMIN_EMAIL, hashedPassword, 'admin']
  )
  console.log('Usuario admin creado (o ya existía)')
  process.exit()
}

seed()
