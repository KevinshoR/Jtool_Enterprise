/* ═══════════════════════════════════════════════════════════
   chatBrain.js — respuestas de respaldo del asistente.
   Se usan cuando Gemini no responde (sin key, sin cuota, error de red).
   Edita los textos con confianza: esto es 100% tuyo.
═══════════════════════════════════════════════════════════ */

function formatCOP(v) {
  return `$${Number(v).toLocaleString('es-CO')}`
}

export const quickQuestions = [
  '¿Cuánto cuesta?',
  '¿Puedo probar gratis?',
  '¿Qué programas tienen?',
  '¿Puedo cancelar cuando quiera?',
]

/*
 * Devuelve una respuesta predefinida según palabras clave.
 * data = { plans: [...], products: [...] } (puede venir vacío si la API falló)
 */
export function getFallbackReply(message, data = {}) {
  const m = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes

  const { plans = [], products = [] } = data

  /* Precios / planes */
  if (/(precio|costo|cuanto|vale|plan|mensualidad|pago)/.test(m)) {
    if (plans.length > 0) {
      const lista = plans
        .map((p) => `• ${p.name}: ${formatCOP(p.price_monthly)}/mes${p.is_featured ? ' ⭐' : ''}`)
        .join('\n')
      return `Nuestros planes de suscripción son:\n${lista}\n\nTodos en pesos colombianos, sin permanencia. Compáralos completos en la página de Precios 👉 /precios`
    }
    return 'Manejamos planes de suscripción mensual en pesos colombianos, sin cláusulas de permanencia. Mira la comparación completa en /precios 😊'
  }

  /* Demo / probar */
  if (/(demo|probar|prueba|gratis|ensayar|test)/.test(m)) {
    return 'Sí puedes probar gratis 🎉 Tenemos un demo interactivo de Barbersoft: agenda citas, crea servicios y explora todo por 10 minutos, sin registrarte. Entra en /demo/barberpro'
  }

  /* Productos */
  if (/(programa|producto|software|que (tienen|venden|ofrecen)|suite)/.test(m)) {
    if (products.length > 0) {
      const lista = products.map((p) => `• ${p.name}: ${p.tagline || p.description || ''}`).join('\n')
      return `Nuestra suite tiene estos programas:\n${lista}\n\nConócelos a fondo en /productos`
    }
    return 'Tenemos programas para repuesteras (JTools), barberías (Barbersoft) y comercios (CatalogApp). Míralos en /productos'
  }

  /* Producto específico */
  if (/(repuest|autopart|taller|jtools)/.test(m)) {
    return 'JTools es nuestro programa para repuesteras: inventario, ventas, compras, proveedores y producción. Fue el primero de la suite — nació en una repuestera real de Medellín. Detalles en /productos/jtools 🔧'
  }
  if (/(barber|peluquer|salon|citas)/.test(m)) {
    return 'Barbersoft organiza tu barbería: agenda de citas con link público para que tus clientes reserven solos, servicios, barberos y caja diaria. Pruébalo tú mismo en /demo/barberpro ✂️'
  }
  if (/(catalogo|tienda|comercio|vender en linea|pedidos)/.test(m)) {
    return 'CatalogApp es un catálogo digital con pedidos en línea, para vender sin necesidad de página web propia. Está en desarrollo — déjanos tus datos en /contacto y te avisamos cuando salga 🛍️'
  }

  /* Cancelación / permanencia */
  if (/(cancelar|permanencia|contrato|clausula|retir)/.test(m)) {
    return 'Puedes cancelar cuando quieras: la suscripción es mes a mes, sin cláusulas de permanencia ni penalidades. Y tus datos quedan disponibles para exportar 👍'
  }

  /* Tarjeta / métodos de pago */
  if (/(tarjeta|credito|pagar|metodo de pago|pse|nequi)/.test(m)) {
    return 'No necesitas tarjeta de crédito para crear tu cuenta ni para probar el demo. Los detalles de métodos de pago te los confirma el equipo en /contacto 😊'
  }

  /* Software a la medida */
  if (/(medida|privado|personalizado|exclusivo|desarroll)/.test(m)) {
    return 'Además de la suscripción, desarrollamos software privado a la medida para tu empresa. Cuéntanos qué necesitas en /contacto y te cotizamos 🚀'
  }

  /* Contacto / humano */
  if (/(contacto|hablar|asesor|humano|persona|telefono|correo|whatsapp)/.test(m)) {
    return 'Con gusto te conectamos con el equipo: escríbenos por el formulario en /contacto o al correo contacto@jtool.com. Atendemos de lunes a viernes, 8 a.m. a 6 p.m. 🇨🇴'
  }

  /* Saludo */
  if (/(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que mas)/.test(m)) {
    return '¡Hola! 👋 Soy el asistente de JTool Enterprise. Puedo contarte sobre nuestros programas, precios o el demo gratis. ¿Qué quieres saber?'
  }

  /* Agradecimiento */
  if (/(gracias|listo|vale|perfecto|ok)/.test(m)) {
    return '¡Con mucho gusto! Si te queda otra duda aquí estoy. Y recuerda que puedes probar el demo gratis en /demo/barberpro 😊'
  }

  /* Default */
  return 'Buena pregunta 🤔 Te puedo contar sobre nuestros programas, precios y el demo gratis. Para algo más específico, el equipo te responde rapidito en /contacto. ¿Te muestro los planes?'
}