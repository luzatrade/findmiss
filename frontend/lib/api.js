// Miglioramenti:
// - Usa NEXT_PUBLIC_API_URL se definita (più prevedibile in produzione / dev).
// - getHeaders accetta isFormData per non impostare Content-Type quando si invia FormData.
// - handleResponse gestisce risposte senza body o non-JSON in modo robusto.
// - Log dell'API_URL per debug in dev.

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} [data] - The response data
 * @property {string} [error] - Error message if request failed
 */

/**
 * @typedef {Object} AuthData
 * @property {string} token - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {Object} user - User object
 * @property {string} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.nickname - User nickname
 * @property {string} user.role - User role
 */

/**
 * Get the API base URL based on environment and hostname
 * @returns {string} The API base URL
 */
function getApiUrl() {
  // Se è definita la variabile d'ambiente Next.js, usala direttamente
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') // rimuove slash finale
  }

  // Server-side (es. SSR) fallback: usa localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:3001/api'
  }

  // Client-side: rileva automaticamente
  const hostname = window.location.hostname
  const protocol = window.location.protocol

  // Se siamo su localhost, usa localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api'
  }

  // Se siamo su findmiss.it o www.findmiss.it, usa api.findmiss.it
  if (hostname === 'findmiss.it' || hostname === 'www.findmiss.it') {
    return `${protocol}//api.findmiss.it/api`
  }

  // Altrimenti usa l'IP/hostname corrente (per accesso da rete locale/cellulare)
  return `http://${hostname}:3001/api`
}

const API_URL = getApiUrl()
// Log utile per debug (solo in dev)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // eslint-disable-next-line no-console
  console.log('[API] using API_URL =', API_URL)
}

/**
 * Helper per gestire le risposte in modo robusto
 * @param {Response} response - Fetch API response object
 * @returns {Promise<*>} Parsed response data
 * @throws {Error} If response is not ok
 */
async function handleResponse(response) {
  // 204 No Content
  if (response.status === 204) return {}

  const contentType = response.headers.get('content-type') || ''

  let data
  try {
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
  } catch (err) {
    // Se il parsing fallisce, restituisci il testo grezzo
    try {
      data = await response.text()
    } catch (e) {
      data = null
    }
  }

  if (!response.ok) {
    const message = (data && (data.error || data.message)) || data || 'Errore nella richiesta'
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Helper per ottenere headers con token
 * @param {boolean} [includeAuth=false] - Whether to include Authorization header
 * @param {boolean} [isFormData=false] - Whether request body is FormData (skips Content-Type)
 * @returns {Object.<string, string>} Headers object
 */
function getHeaders(includeAuth = false, isFormData = false) {
  const headers = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}

// ==========================================
// AUTH
// ==========================================

/**
 * Login user with email and password
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {Promise<ApiResponse>} Response with user data and tokens
 */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false, false),
    body: JSON.stringify({ email, password }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data.token) {
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
  }

  return data
}

/**
 * Register new user
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {string} nickname - User nickname/display name
 * @returns {Promise<ApiResponse>} Response with user data and tokens
 */
export async function register(email, password, nickname) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false, false),
    body: JSON.stringify({ email, password, nickname }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data.token) {
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
  }

  return data
}

/**
 * Logout current user and clear tokens
 * @returns {Promise<void>}
 */
export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(false, false),
      body: JSON.stringify({ refreshToken }),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore logout:', error)
  }

  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

/**
 * Refresh authentication token
 * @returns {Promise<ApiResponse>} Response with new tokens
 * @throws {Error} If no refresh token is available
 */
export async function refreshToken() {
  const refreshTokenValue = localStorage.getItem('refreshToken')

  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(false, false),
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data.token) {
    localStorage.setItem('token', data.data.token)
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken)
    }
  }

  return data
}

// NOTE: quando invii FormData (upload media), chiama getHeaders(true, true) e usa body = formData (non impostare Content-Type)
