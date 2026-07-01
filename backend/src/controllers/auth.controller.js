const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db/db')

function isPasswordValid(password) {
  const minLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' })
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return res.status(401).json({ message: 'Credenciales inválidas' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

async function register(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' })
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' })
  }

  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'El correo electrónico no es válido' })
  }

  if (!isPasswordValid(password)) {
    return res.status(400).json({
      message:
        'La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial',
    })
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, hashedPassword]
    )
    res.status(201).json({ message: 'Usuario creado', user: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

async function me(req, res) {
  res.json({ user: req.user })
}

module.exports = { login, register, me }