/*
 * Aviso a Barbersoft cuando una empresa con BarberPro activo cambia de estado.
 * Best-effort: si Barbersoft no responde, no debe tumbar el flujo de admin.
 */
async function syncBarbersoft({ companyId, active, planCode }) {
  const baseUrl = process.env.BARBERSOFT_API_URL
  const secret = process.env.JTOOL_SYNC_SECRET
  if (!baseUrl || !secret) {
    console.warn('syncBarbersoft: BARBERSOFT_API_URL o JTOOL_SYNC_SECRET no configurados, se omite el aviso')
    return
  }

  const response = await fetch(`${baseUrl}/api/sync/company`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      company_id: companyId,
      active,
      plan_tier: planCode,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`syncBarbersoft respondió ${response.status}: ${text}`)
  }
}

module.exports = { syncBarbersoft }
