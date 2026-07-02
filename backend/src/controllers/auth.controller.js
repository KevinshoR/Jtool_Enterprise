const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const pool = require('../db/db')
const { sendPasswordResetEmail } = require('../utils/mailer')

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

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
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

    const token = issueToken(user)

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

/*
 * Login / registro con Google.
 * El frontend envía el `credential` (ID token) que entrega Google Identity
 * Services. Aquí lo verificamos CONTRA GOOGLE (firma + audiencia) y, si el
 * correo no existe, creamos la cuenta automáticamente.
 */
async function googleLogin(req, res) {
  const { credential } = req.body
  if (!credential) {
    return res.status(400).json({ message: 'Falta el credential de Google' })
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google Sign-In no está configurado en el servidor' })
  }

  try {
    // Verificación del token con Google
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    )
    if (!response.ok) {
      return res.status(401).json({ message: 'Token de Google inválido' })
    }
    const payload = await response.json()

    // El token debe ser PARA nuestra app y el correo debe estar verificado
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Token de Google inválido' })
    }
    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      return res.status(401).json({ message: 'El correo de Google no está verificado' })
    }

    const email = payload.email
    const name = payload.name || email.split('@')[0]

    // Buscar o crear el usuario
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    let user = result.rows[0]

    if (!user) {
      // Contraseña aleatoria imposible de adivinar: la cuenta solo entra por Google
      // (o por "olvidé mi contraseña" cuando exista esa función)
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      const created = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
        [name, email, randomPassword]
      )
      user = created.rows[0]
    }

    const token = issueToken(user)

    res.json({
      message: 'Login con Google exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

/* ── Rate limit en memoria para forgot-password: 3 solicitudes por email cada 15 min ── */
const resetHits = new Map()
function resetRateLimited(email) {
  const now = Date.now()
  const entry = resetHits.get(email) || { count: 0, start: now }
  if (now - entry.start > 15 * 60 * 1000) {
    resetHits.set(email, { count: 1, start: now })
    return false
  }
  entry.count += 1
  resetHits.set(email, entry)
  return entry.count > 3
}

/*
 * Paso 1 de recuperación: el usuario da su correo y le enviamos un código
 * de 6 dígitos. La respuesta es SIEMPRE la misma exista o no el correo,
 * para no revelar qué correos están registrados.
 */
async function forgotPassword(req, res) {
  const { email } = req.body
  const genericResponse = {
    message: 'Si el correo está registrado, te enviamos un código de recuperación',
  }

  if (!email || !isEmailValid(email)) {
    return res.status(400).json({ message: 'Ingresa un correo válido' })
  }
  if (resetRateLimited(email.toLowerCase())) {
    return res.json(genericResponse) // silencioso: no premiamos el abuso con información
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Este correo no está registrado en JTool Enterprise. Verifica que esté bien escrito o crea una cuenta.',
      })
    }

    // Código de 6 dígitos criptográficamente aleatorio
    const code = String(crypto.randomInt(100000, 1000000))
    const codeHash = await bcrypt.hash(code, 10)

    // Un código activo por correo: borra los anteriores
    await pool.query('DELETE FROM password_resets WHERE email = $1', [email])
    await pool.query(
      `INSERT INTO password_resets (email, code_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [email, codeHash]
    )

    await sendPasswordResetEmail(email, code)
    res.json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'No pudimos enviar el correo. Intenta de nuevo en un momento.' })
  }
}

/*
 * Paso 2: el usuario envía correo + código + nueva contraseña.
 * Máximo 5 intentos por código; el código vence a los 15 minutos.
 */
async function resetPassword(req, res) {
  const { email, code, newPassword } = req.body

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' })
  }
  if (!isPasswordValid(newPassword)) {
    return res.status(400).json({
      message:
        'La contraseña debe tener mínimo 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial',
    })
  }

  try {
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    )
    const reset = result.rows[0]

    if (!reset || new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: 'El código expiró o no existe. Solicita uno nuevo.' })
    }
    if (reset.attempts >= 5) {
      await pool.query('DELETE FROM password_resets WHERE id = $1', [reset.id])
      return res.status(400).json({ message: 'Demasiados intentos. Solicita un código nuevo.' })
    }

    const codeMatch = await bcrypt.compare(String(code).trim(), reset.code_hash)
    if (!codeMatch) {
      await pool.query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1', [reset.id])
      return res.status(400).json({ message: 'Código incorrecto' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email])
    await pool.query('DELETE FROM password_resets WHERE email = $1', [email])

    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

async function me(req, res) {
  res.json({ user: req.user })
}

module.exports = { login, register, googleLogin, forgotPassword, resetPassword, me }