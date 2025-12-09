/**
 * API Helper per FindMiss
 * Gestisce tutte le chiamate HTTP al backend
 */

// Rileva automaticamente l'URL dell'API basato sull'host corrente
function getApiUrl() {
  // Se NEXT_PUBLIC_API_URL è definito, usalo (priorità massima)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  if (typeof window === 'undefined') {
    // Server-side: usa localhost
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

// Helper per gestire le risposte
async function handleResponse(response) {
  const data = await response.json()
  
  if (!response.ok) {
    const error = new Error(data.error || 'Errore nella richiesta')
    error.status = response.status
    error.data = data
    throw error
  }
  
  return data
}

// Helper per ottenere headers con token
function getHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
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

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
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

export async function register(email, password, nickname) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
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

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken')
  
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ refreshToken }),
    })
  } catch (error) {
    console.error('Errore logout:', error)
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
    headers: getHeaders(),
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })
  
  const data = await handleResponse(response)
  
  if (data.success && data.data.token) {
    localStorage.setItem('token', data.data.token)
  }
  
  return data
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export async function getAnnouncements(params = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value)
    }
  })
  
  const url = `${API_URL}/announcements${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  
  const response = await fetch(url, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function getAnnouncement(id) {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function createAnnouncement(data) {
  const response = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  })
  
  return handleResponse(response)
}

export async function updateAnnouncement(id, data) {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data),
  })
  
  return handleResponse(response)
}

export async function deleteAnnouncement(id) {
  const response = await fetch(`${API_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function likeAnnouncement(id) {
  const response = await fetch(`${API_URL}/announcements/${id}/like`, {
    method: 'POST',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function contactAnnouncement(id) {
  const response = await fetch(`${API_URL}/announcements/${id}/contact`, {
    method: 'POST',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

// ==========================================
// CITIES
// ==========================================

export async function getCities(search = '', limit = 20) {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (search) params.append('search', search)
  
  const response = await fetch(`${API_URL}/cities?${params.toString()}`, {
    headers: getHeaders(),
  })
  
  return handleResponse(response)
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    headers: getHeaders(),
  })
  
  return handleResponse(response)
}

// ==========================================
// REELS
// ==========================================

export async function getReels(params = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value)
    }
  })
  
  const url = `${API_URL}/reels${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  
  const response = await fetch(url, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function likeReel(id) {
  const response = await fetch(`${API_URL}/reels/${id}/like`, {
    method: 'POST',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function viewReel(id) {
  const response = await fetch(`${API_URL}/reels/${id}/view`, {
    method: 'POST',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

// ==========================================
// CHAT
// ==========================================

export async function getConversations() {
  const response = await fetch(`${API_URL}/chat/conversations`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function getMessages(conversationId, params = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value)
    }
  })
  
  const url = `${API_URL}/chat/conversations/${conversationId}/messages${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  
  const response = await fetch(url, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function sendMessage(conversationId, content, type = 'text') {
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ content, message_type: type }),
  })
  
  return handleResponse(response)
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function getNotifications(params = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value)
    }
  })
  
  const url = `${API_URL}/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  
  const response = await fetch(url, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function markNotificationRead(id) {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

// ==========================================
// PAYMENTS
// ==========================================

export async function getPlans() {
  const response = await fetch(`${API_URL}/payments/plans`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function createCheckout(planId, announcementId) {
  const response = await fetch(`${API_URL}/payments/checkout`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ plan_id: planId, announcement_id: announcementId }),
  })
  
  return handleResponse(response)
}

export async function getPaymentHistory() {
  const response = await fetch(`${API_URL}/payments/history`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

// ==========================================
// UPLOAD
// ==========================================

export async function uploadMedia(file, type = 'image') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  const headers = {}
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })
  
  return handleResponse(response)
}

// ==========================================
// FOLLOWS
// ==========================================

export async function followUser(userId) {
  const response = await fetch(`${API_URL}/follows/${userId}`, {
    method: 'POST',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function unfollowUser(userId) {
  const response = await fetch(`${API_URL}/follows/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function getFollowers(userId) {
  const response = await fetch(`${API_URL}/follows/${userId}/followers`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

export async function getFollowing(userId) {
  const response = await fetch(`${API_URL}/follows/${userId}/following`, {
    headers: getHeaders(true),
  })
  
  return handleResponse(response)
}

// Export API_URL for components that need it
export { API_URL }

