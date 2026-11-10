export function formatMediaUploadError(error, context = {}) {
  const raw =
    (typeof error === 'string' ? error : null) ||
    error?.message ||
    error?.error ||
    'Caricamento non riuscito'

  if (/sessione|accesso richiesto|non valida/i.test(raw)) {
    return 'Sessione scaduta: effettua di nuovo l\'accesso e riprova.'
  }
  if (/blob non configurato|blob store|storage non configurato/i.test(raw)) {
    return 'Storage media non configurato. Riprova più tardi o contatta l\'assistenza.'
  }
  if (/failed to retrieve the presigned url/i.test(raw)) {
    return 'Errore nello storage media (URL di caricamento). Ricarica la pagina, verifica la connessione e riprova.'
  }
  if (/allowed content type|content.type|tipo non consentito/i.test(raw)) {
    return 'Formato file non accettato. Usa JPG, PNG, WebP, GIF, HEIC o MP4.'
  }
  if (/URL media non consentito|non accettato dal server/i.test(raw)) {
    return 'Il file è stato caricato ma il server non l\'ha accettato. Riprova con JPG, PNG, WebP o MP4.'
  }
  if (/formato non supportato|troppo grande|heic/i.test(raw)) {
    return raw
  }
  if (/perdono a ogni redeploy|persistent/i.test(raw)) {
    return raw
  }

  const fileHint = context.fileName ? ` File: ${context.fileName}.` : ''
  const indexHint =
    context.index != null && context.total != null
      ? ` (${context.index + 1}/${context.total})`
      : ''

  return `${raw}${indexHint}${fileHint}`.trim()
}

export function buildMediaUploadSuccessMessage({
  kind = 'media',
  count = 1,
  announcementStatus,
  publishedToReels = false,
  destination = 'annuncio',
} = {}) {
  const n = Number(count) || 0
  const plural = n === 1 ? '' : 's'
  const kindLabel =
    kind === 'reel' ? 'Reel' : kind === 'story' ? 'Storia' : n === 1 ? 'File' : 'File'

  let visibility =
    announcementStatus === 'pending'
      ? 'L\'annuncio è in attesa di approvazione: comparirà in homepage dopo l\'ok admin.'
      : announcementStatus === 'paused'
        ? 'L\'annuncio è in pausa: attivalo da I miei annunci per essere visibile.'
        : announcementStatus === 'active' || !announcementStatus
          ? 'Il contenuto è salvato e visibile sul sito (homepage e profilo).'
          : 'Contenuto salvato nel tuo account.'

  if (kind === 'story') {
    visibility = 'Storia pubblicata: visibile per 24 ore nella sezione Storie.'
  }

  if (publishedToReels) {
    visibility += ' Il reel è anche nel feed Reels.'
  }

  if (kind === 'reel') {
    return `${kindLabel} caricato sul ${destination}. ${visibility}`
  }

  return `${n} ${kindLabel.toLowerCase()} caricat${plural ? 'i' : 'o'} sul ${destination}. ${visibility}`
}
