const nodemailer = require('nodemailer')

/*
 * Envío de correos con Gmail (gratis, hasta ~500/día).
 * Requiere en backend/.env:
 *   MAIL_USER=tucorreo@gmail.com
 *   MAIL_PASS=contraseña_de_aplicación_de_16_letras (myaccount.google.com/apppasswords)
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

async function sendPasswordResetEmail(to, code) {
  const html = `
  <div style="background:#F5F7FA;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0E2A47;padding:28px 32px;text-align:center;">
        <div style="display:inline-block;background:#00C896;color:#0E2A47;font-weight:900;font-size:18px;border-radius:12px;padding:10px 14px;">JT</div>
        <p style="color:#ffffff;font-size:18px;font-weight:bold;margin:14px 0 0;">JTool Enterprise</p>
      </div>
      <div style="padding:32px;">
        <h1 style="color:#0E2A47;font-size:20px;margin:0 0 12px;">Recupera tu contraseña</h1>
        <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Recibimos una solicitud para restablecer tu contraseña. Usa este código para continuar:
        </p>
        <div style="background:#F5F7FA;border:2px dashed #00C896;border-radius:12px;padding:18px;text-align:center;">
          <span style="color:#0E2A47;font-size:32px;font-weight:900;letter-spacing:8px;font-family:monospace;">${code}</span>
        </div>
        <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:24px 0 0;">
          El código vence en <strong>15 minutos</strong>. Si tú no pediste este cambio,
          ignora este correo — tu contraseña sigue siendo la misma.
        </p>
      </div>
      <div style="background:#F5F7FA;padding:16px 32px;text-align:center;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">JTool Enterprise · Medellín, Colombia</p>
      </div>
    </div>
  </div>`

  await transporter.sendMail({
    from: `"JTool Enterprise" <${process.env.MAIL_USER}>`,
    to,
    subject: `${code} es tu código de recuperación — JTool Enterprise`,
    html,
  })
}

module.exports = { sendPasswordResetEmail }