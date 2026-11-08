/**
 * Allinea localStorage `user` con /users/profile (es. ruolo advertiser dopo primo annuncio).
 */
export async function syncStoredUserFromProfile(apiUrl, token) {
  if (!token || typeof window === 'undefined') return null

  try {
    const res = await fetch(`${apiUrl}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!data.success || !data.data) return null

    let previous = {}
    try {
      previous = JSON.parse(window.localStorage.getItem('user') || '{}')
    } catch {
      previous = {}
    }

    const merged = { ...previous, ...data.data }
    window.localStorage.setItem('user', JSON.stringify(merged))
    return merged
  } catch {
    return null
  }
}
