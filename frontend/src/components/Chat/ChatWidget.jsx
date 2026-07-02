import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import api from '../../services/api'
import { getFallbackReply, quickQuestions } from './chatBrain'

/* ═══════════════════════════════════════════════════════════
   ChatWidget — asistente del sitio.
   Intenta responder con Gemini (POST /api/chat); si el backend
   indica fallback (sin key, sin cuota, error), responde con
   las respuestas predefinidas de chatBrain.js. El visitante
   nunca ve un chat muerto.
═══════════════════════════════════════════════════════════ */

const saludo = {
  role: 'model',
  text: '¡Hola! 👋 Soy el asistente de JTool Enterprise. Pregúntame por nuestros programas, precios o el demo gratis.',
}

/* Convierte rutas tipo /precios en enlaces clickeables */
function renderTexto(text) {
  const partes = text.split(/(\/[a-z-]+(?:\/[a-z0-9-]+)?)/g)
  return partes.map((p, i) =>
    p.startsWith('/') && p.length > 1 ? (
      <a key={i} href={p} className="font-bold text-esmeralda underline underline-offset-2">
        {p}
      </a>
    ) : (
      <span key={i}>{p}</span>
    )
  )
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([saludo])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [companyData, setCompanyData] = useState({})
  const bottomRef = useRef(null)

  /* Datos para el fallback (planes y productos reales) */
  useEffect(() => {
    if (!open || companyData.plans) return
    Promise.all([
      api.get('/plans').then((r) => r.data).catch(() => []),
      api.get('/products').then((r) => r.data).catch(() => []),
    ]).then(([plans, products]) => setCompanyData({ plans, products }))
  }, [open, companyData.plans])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, open])

  async function enviar(texto) {
    const msg = (texto ?? input).trim()
    if (!msg || typing) return
    setInput('')
    const nuevoHistorial = [...messages, { role: 'user', text: msg }]
    setMessages(nuevoHistorial)
    setTyping(true)

    let reply = null
    try {
      const { data } = await api.post('/chat', {
        message: msg,
        history: nuevoHistorial.slice(1, -1), // sin el saludo ni el mensaje actual
      })
      if (data?.reply && !data.fallback) reply = data.reply
    } catch {
      reply = null
    }

    if (!reply) reply = getFallbackReply(msg, companyData)

    // Pequeña pausa para que se sienta natural
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
      setTyping(false)
    }, 350)
  }

  return (
    <>
      {/* Burbuja flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
        className="fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-esmeralda text-noche shadow-xl shadow-esmeralda/30 transition-all duration-300 hover:scale-110"
      >
        {open ? <X size={22} strokeWidth={2.5} /> : <MessageCircle size={22} strokeWidth={2.5} />}
      </button>

      {/* Ventana */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[80] flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl"
          style={{ height: 'min(560px, 75vh)', animation: 'chatIn .3s ease both' }}
        >
          <style>{`
            @keyframes chatIn { from { opacity:0; transform: translateY(16px) scale(.97); } to { opacity:1; transform:none; } }
            @keyframes dotBlink { 0%,80%,100% { opacity:.25 } 40% { opacity:1 } }
          `}</style>

          {/* Header */}
          <div className="flex items-center gap-3 bg-noche px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-esmeralda font-black text-noche text-sm">
              JT
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Asistente JTool</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-esmeralda" />
                En línea
              </p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto bg-neblina px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'self-end rounded-br-md bg-noche text-white'
                      : 'self-start rounded-bl-md border border-black/5 bg-white text-grafito shadow-sm'
                  }`}
                >
                  {m.role === 'model' ? renderTexto(m.text) : m.text}
                </div>
              ))}

              {typing && (
                <div className="flex gap-1.5 self-start rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-grafito/40"
                      style={{ animation: `dotBlink 1.2s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Preguntas rápidas (solo al inicio) */}
            {messages.length === 1 && !typing && (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => enviar(q)}
                    className="rounded-full border border-esmeralda/40 bg-esmeralda/5 px-3.5 py-1.5 text-xs font-semibold text-noche transition-colors hover:bg-esmeralda/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-black/5 bg-white px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviar()}
              maxLength={500}
              placeholder="Escribe tu pregunta..."
              className="flex-1 rounded-xl bg-neblina px-4 py-2.5 text-sm text-grafito outline-none placeholder:text-grafito/35"
            />
            <button
              onClick={() => enviar()}
              disabled={!input.trim() || typing}
              aria-label="Enviar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-esmeralda text-noche transition-all duration-300 hover:scale-105 disabled:opacity-40"
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget