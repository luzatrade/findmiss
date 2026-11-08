const SITE_LABEL = 'findmiss.it'

/**
 * Testo precompilato WhatsApp: es. "Ciao Lara ❤️ (Roma), ho visto il tuo annuncio su findmiss.it"
 */
export function buildWhatsAppIntroMessage({ name, city } = {}) {
  const displayName = (name || 'lì').trim()
  const cityLabel = city && !/^n\/d$/i.test(String(city).trim()) ? String(city).trim() : ''
  const cityPart = cityLabel ? ` (${cityLabel})` : ''
  return `Ciao ${displayName} ❤️${cityPart}, ho visto il tuo annuncio su ${SITE_LABEL}`
}

export function buildWhatsAppUrl(phone, { name, city } = {}) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return null
  const text = encodeURIComponent(buildWhatsAppIntroMessage({ name, city }))
  return `https://wa.me/${digits}?text=${text}`
}
