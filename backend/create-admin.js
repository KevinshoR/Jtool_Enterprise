require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool = require('./src/db/db')

function isPasswordValid(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)
}

async function run() {
  const [email, password, name] = process.argv.slice(2)
  if (!email || !password) {
    console.error('Uso: node create-admin.js <email> <password> [nombre]')
    process.exit(1)
  }
  if (!isPasswordValid(password)) {
    console.error('La contraseña debe tener min 8 caracteres, mayuscula, minuscula, numero y especial')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password, 10)
  const existe = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existe.rows.length > 0) {
    await pool.query("UPDATE users SET role = 'admin', password = $1 WHERE email = $2", [hash, email])
    console.log('Usuario promovido a admin y contrasena actualizada:', email)
  } else {
    await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')", [name || 'Admin', email, hash])
    console.log('Admin creado:', email)
  }
  process.exit()
}
run().catch((e) => { console.error(e.message); process.exit(1) })
