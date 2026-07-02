const pool = require('../db/db')

/* ═══════════════════════════════════════════════════════════
   Chat con Gemini (capa gratuita de Google AI Studio).
   - Lee planes y productos REALES de la BD para responder precios al día.
   - Rate limit en memoria por IP (protege tu cuota gratuita).
   - Si Gemini falla o se agota la cuota → responde { fallback: true }
     y el frontend usa las respuestas predefinidas (chatBrain.js).

   Requiere en backend/.env:
     GEMINI_API_KEY=AIza...
     GEMINI_MODEL=gemini-2.5-flash   (opcional, este es el default)
═══════════════════════════════════════════════════════════ */

/* ── Rate limit simple en memoria: 20 mensajes por IP por hora ── */
const RATE_LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const entry = hits.get(ip) || { count: 0, start: now }
  if (now - entry.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now })
    return false
  }
  entry.count += 1
  hits.set(ip, entry)
  return entry.count > RATE_LIMIT
}

/* ── Cache de datos de la BD (5 min) para no golpearla en cada mensaje ── */
let cache = { data: null, at: 0 }

async function getCompanyData() {
  if (cache.data && Date.now() - cache.at < 5 * 60 * 1000) return cache.data
  const [plans, products] = await Promise.all([
    pool.query('SELECT name, description, price_monthly, price_annual, is_featured FROM plans ORDER BY sort_order'),
    pool.query('SELECT code, name, description, tagline FROM products ORDER BY name'),
  ])
  cache = { data: { plans: plans.rows, products: products.rows }, at: Date.now() }
  return cache.data
}

function formatCOP(v) {
  return `$${Number(v).toLocaleString('es-CO')} COP`
}

function buildSystemPrompt({ plans, products }) {
  const planesTxt = plans
    .map(
      (p) =>
        `- ${p.name}${p.is_featured ? ' (recomendado)' : ''}: ${formatCOP(p.price_monthly)}/mes` +
        (p.price_annual ? ` o ${formatCOP(p.price_annual)}/año` : '') +
        (p.description ? `. ${p.description}` : '')
    )
    .join('\n')

  const productosTxt = products
    .map((p) => `- ${p.name} (/productos/${p.code}): ${p.tagline || p.description || ''}`)
    .join('\n')

  return `Eres el asistente virtual de JTool Enterprise, una empresa de software de Medellín, Colombia.

SOBRE LA EMPRESA:
JTool Enterprise vende software de gestión para negocios colombianos por SUSCRIPCIÓN MENSUAL (también hay opción de software privado a la medida, para eso se cotiza por el formulario de contacto). Nació detrás del mostrador de una repuestera en Medellín. Precios en pesos colombianos, soporte en español, sin cláusulas de permanencia, se puede cancelar cuando quiera. No se necesita tarjeta de crédito para crear la cuenta.

PROGRAMAS DE LA SUITE:
${productosTxt}

PLANES DE SUSCRIPCIÓN (precios actuales):
${planesTxt}

PÁGINAS DEL SITIO (usa estas rutas al recomendar):
- /productos → catálogo de programas
- /precios → comparación completa de planes
- /demo/barberpro → demo interactivo gratis de Barbersoft (10 minutos, sin registro)
- /contacto → formulario para hablar con el equipo o cotizar software a la medida
- /registro → crear cuenta

REGLAS:
1. Responde SIEMPRE en español, con tono cercano colombiano pero profesional. Respuestas CORTAS (máximo 3-4 frases) — es un chat, no un correo.
2. Solo hablas de JTool Enterprise, sus productos, planes y cómo funciona. Si preguntan otra cosa (tareas, temas generales, otros temas), redirige amablemente: "Te ayudo con todo lo de JTool Enterprise 😊 ¿Quieres saber de nuestros programas o planes?"
3. Nunca inventes precios, descuentos ni funciones que no estén en esta información. Si no sabes algo, di que el equipo lo responde en /contacto.
4. Cuando menciones un precio, usa los de arriba exactamente.
5. Recomienda el demo de Barbersoft cuando alguien dude — probar convence más que leer.
6. No pidas ni guardes datos personales.`
}

async function chat(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  const { message, history = [] } = req.body || {}

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'El mensaje es requerido' })
  }
  if (message.length > 500) {
    return res.status(400).json({ message: 'El mensaje es demasiado largo (máx. 500 caracteres)' })
  }
  if (rateLimited(ip)) {
    return res.json({ reply: null, fallback: true, reason: 'rate_limit' })
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: null, fallback: true, reason: 'no_key' })
  }

  try {
    const data = await getCompanyData()
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    // Historial: solo los últimos 8 turnos, saneados
    const contents = history
      .slice(-8)
      .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model'))
      .map((m) => ({ role: m.role, parts: [{ text: String(m.text).slice(0, 500) }] }))
    contents.push({ role: 'user', parts: [{ text: message.trim() }] })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt(data) }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
        }),
      }
    )

    if (!response.ok) {
      console.error('Gemini error:', response.status, await response.text().catch(() => ''))
      return res.json({ reply: null, fallback: true, reason: 'gemini_error' })
    }

    const json = await response.json()
    const reply = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || null

    if (!reply) return res.json({ reply: null, fallback: true, reason: 'empty' })
    return res.json({ reply, fallback: false })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.json({ reply: null, fallback: true, reason: 'exception' })
  }
}

module.exports = { chat }