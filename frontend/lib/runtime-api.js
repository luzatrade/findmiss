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

export function getWsUrl() {
  const envWsUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_WS_URL : null
  if (envWsUrl && typeof envWsUrl === 'string') {
    const normalized = envWsUrl.trim().replace(/\/$/, '')
    if (normalized.length > 0) return normalized
  }

  return getApiOrigin()
}

export function toAbsoluteMediaUrl(value, apiOrigin = getApiOrigin(), fallback = 'https://via.placeholder.com/300x400?text=No+Image') {
  if (!value || typeof value !== 'string') return fallback
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return `${apiOrigin}${value}`
  return `${apiOrigin}/${value}`
}
