import { getApiOrigin, toAbsoluteMediaUrl } from './runtime-api'

export const MEDIA_SIZES = {
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px',
  profile: '(max-width: 768px) 100vw, 720px',
  hero: '100vw',
}

export function pickMediaUrl(media, variant = 'auto', apiOrigin = getApiOrigin()) {
  if (!media) return null

  const full = media.url || media.thumbnail_url
  const thumb = media.thumbnail_url || media.url

  if (variant === 'full') {
    return toAbsoluteMediaUrl(full, apiOrigin)
  }
  if (variant === 'thumb') {
    return toAbsoluteMediaUrl(thumb, apiOrigin)
  }

  // auto: prefer thumbnail for lists/feeds
  return toAbsoluteMediaUrl(thumb, apiOrigin)
}

export function buildMediaSrcSet(media, apiOrigin = getApiOrigin()) {
  if (!media?.url) return undefined

  const full = toAbsoluteMediaUrl(media.url, apiOrigin)
  const thumb = media.thumbnail_url
    ? toAbsoluteMediaUrl(media.thumbnail_url, apiOrigin)
    : full

  if (thumb === full) return undefined
  return `${thumb} 480w, ${full} 1920w`
}

export function getPrimaryMedia(announcement) {
  if (!announcement?.media?.length) return null
  return announcement.media.find((item) => item.is_primary) || announcement.media[0]
}

export function validateMediaFile(file, { maxImageMb = 12, maxVideoMb = 80 } = {}) {
  if (!file) return 'Seleziona un file'

  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  if (!isVideo && !isImage) {
    return 'Formato non supportato. Usa JPG, PNG, WebP o MP4.'
  }

  const maxBytes = (isVideo ? maxVideoMb : maxImageMb) * 1024 * 1024
  if (file.size > maxBytes) {
    return isVideo
      ? `Video troppo grande (max ${maxVideoMb}MB)`
      : `Immagine troppo grande (max ${maxImageMb}MB)`
  }

  return null
}
