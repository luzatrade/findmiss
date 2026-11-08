import { getApiUrl } from './runtime-api'

export async function fetchCities({ search = '', limit = 150 } = {}) {
  const API_URL = getApiUrl()
  const q = String(search || '').trim()
  const params = new URLSearchParams({ limit: String(limit) })
  if (q.length > 0) {
    params.set('search', q)
  }

  const response = await fetch(`${API_URL}/cities?${params.toString()}`, {
    cache: 'no-store',
  })
  const data = await response.json()
  if (!data.success || !Array.isArray(data.data)) {
    return []
  }
  return data.data
}
