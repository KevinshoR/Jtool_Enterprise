require('dotenv').config()
const pool = require('./src/db/db')

/*
 * Crea la tabla donde viven los códigos de recuperación de contraseña.
 * Guardamos el HASH del código (nunca el código en claro), con expiración
 * y contador de intentos.
 *
 * Correr una sola vez:  node migrate-password-reset.js
 */
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
  `)
  console.log('✓ Tabla password_resets lista')
  process.exit()
}

migrate().catch((e) => {
  console.error('Error en la migración:', e.message)
  process.exit(1)
})