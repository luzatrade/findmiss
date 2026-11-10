const PROD_API_URL = 'https://api.findmiss.it/api'
const LOCAL_API_URL = 'http://localhost:3001/api'

export function getApiUrl() {
  const envApiUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_URL : null
  if (envApiUrl && typeof envApiUrl === 'string') {
    const normalized = envApiUrl.trim().replace(/\/$/, '')
    if (normalized.length > 0) return normalized
  }

  if (typeof window === 'undefined') {
    return PROD_API_URL
  }

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_API_URL
  }

  return PROD_API_URL
}

export function getApiOrigin() {
  return getApiUrl().replace(/\/api\/?$/, '')
}

/** Origine del sito Next.js (findmiss.it), non Railway API. */
export function getSiteOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (fromEnv && typeof fromEnv === 'string') {
    const trimmed = fromEnv.trim().replace(/\/$/, '')
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
  }

  return 'https://www.findmiss.it'
}

export function getWsUrl() {
  const envWsUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_WS_URL : null
  if (envWsUrl && typeof envWsUrl === 'string') {
    const normalized = envWsUrl.trim().replace(/\/$/, '')
    if (normalized.length > 0) return normalized
  }

  return getApiOrigin()
}

function wrapPrivateVercelBlobUrl(url) {
  if (typeof url !== 'string' || !url.includes('.private.blob.vercel-storage.com/')) {
    return url
  }
  return `/api/media/serve?url=${encodeURIComponent(url)}`
}

function isFrontendMediaPath(path) {
  return typeof path === 'string' && path.startsWith('/api/media/')
}

/** Corregge URL salvate per errore su api.findmiss.it invece che sul frontend. */
function normalizeStoredMediaPath(value) {
  if (!value || typeof value !== 'string') return value
  if (isFrontendMediaPath(value)) return value
  try {
    const parsed = new URL(value)
    if (parsed.pathname.startsWith('/api/media/')) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // not an absolute URL
  }
  return value
}

function resolveFrontendMediaUrl(pathWithQuery) {
  if (typeof window !== 'undefined') {
    return pathWithQuery
  }
  return `${getSiteOrigin()}${pathWithQuery}`
}

export function toAbsoluteMediaUrl(value, apiOrigin = getApiOrigin(), fallback = 'https://via.placeholder.com/300x400?text=No+Image') {
  if (!value || typeof value !== 'string') return fallback

  const normalized = normalizeStoredMediaPath(value)

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
  const wrapped = wrapPrivateVercelBlobUrl(normalized)
    if (wrapped !== normalized) {
      return resolveFrontendMediaUrl(wrapped)
    }
    return normalized
  }

  if (isFrontendMediaPath(normalized)) {
    return resolveFrontendMediaUrl(normalized)
  }

  if (normalized.startsWith('/')) return `${apiOrigin}${normalized}`
  return `${apiOrigin}/${normalized}`
}
