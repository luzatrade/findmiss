function getApiUrl() {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return 'http://localhost:3001/api'
  }

  const hostname = window.location.hostname
  const protocol = window.location.protocol

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/api'
  }

  if (hostname === 'findmiss.it' || hostname === 'www.findmiss.it') {
    return `${protocol}//api.findmiss.it/api`
  }

  return `http://${hostname}:3001/api`
}

export const API_URL = getApiUrl()

async function handleResponse(response) {
  if (response.status === 204) return {}

  const contentType = response.headers.get('content-type') || ''
  let data

  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    const text = await response.text()
    data = text ? { message: text } : {}
  }

  if (!response.ok) {
    const message = data.error || data.message || 'Errore nella richiesta'
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

function getHeaders(includeAuth = false, isFormData = false) {
  const headers = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  return headers
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data?.token) {
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
  }

  return data
}

export async function register(email, password, nickname) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, password, nickname }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data?.token) {
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.data.user))
  }

  return data
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    // no-op
  }

  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export async function refreshToken() {
  const refreshTokenValue = localStorage.getItem('refreshToken')

  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })

  const data = await handleResponse(response)

  if (data.success && data.data?.token) {
    localStorage.setItem('token', data.data.token)
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken)
    }
  }

  return data
}

export async function getConversationMessages(conversationId, { page = 1, limit = 50 } = {}) {
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
    headers: getHeaders(true),
  })
  return handleResponse(response)
}

export async function sendMessage(conversationId, payload) {
  const content = payload?.content || payload?.text || ''
  const messageType = payload?.message_type || payload?.type || 'text'

  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({
      content,
      message_type: messageType,
      protected_media: payload?.protected_media,
    }),
  })

  return handleResponse(response)
}
