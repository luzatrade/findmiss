const LOGIN_REDIRECT_PREFIXES = [
  '/',
  '/my-announcements',
  '/profile',
  '/announcements',
  '/reels',
  '/settings',
  '/payments',
  '/admin',
  '/stories',
  '/chat',
  '/filtri',
  '/saved',
]

export function parseAuthRedirect(searchParams) {
  if (!searchParams) return null

  const rawRedirect = searchParams.get('redirect')
  let path = null

  if (rawRedirect) {
    try {
      path = decodeURIComponent(rawRedirect)
    } catch {
      path = rawRedirect
    }
  }

  const announcement = searchParams.get('announcement')
  if (path === '/chat' && announcement) {
    path = `/chat?announcement=${announcement}`
  } else if (!path && announcement) {
    path = `/chat?announcement=${announcement}`
  }

  const upload = searchParams.get('upload')
  if (path === '/reels' && upload) {
    path = `/reels?upload=${upload}`
  }

  if (path && path.startsWith('/') && !path.startsWith('//')) {
    return path
  }

  return null
}

export function buildAuthHref({ redirect, register = false, role } = {}) {
  const params = new URLSearchParams()
  if (register) params.set('register', '1')
  if (role === 'advertiser') params.set('role', 'advertiser')
  if (redirect) params.set('redirect', redirect)
  const query = params.toString()
  return query ? `/auth?${query}` : '/auth'
}

function isAllowedRedirect(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return false
  return LOGIN_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)
  )
}

/**
 * Dove mandare l'utente dopo login o registrazione.
 * La registrazione non deve riusare redirect verso chat altrui (es. contatto LARA).
 */
export function resolvePostAuthPath({ redirect, isRegister, role }) {
  const safe = isAllowedRedirect(redirect) ? redirect : null

  if (isRegister) {
    if (role === 'advertiser') {
      if (
        safe &&
        (safe.startsWith('/announcements/new') ||
          safe.startsWith('/profile/edit') ||
          safe.startsWith('/my-announcements'))
      ) {
        return safe
      }
      return '/announcements/new'
    }

    if (safe?.startsWith('/chat')) {
      return '/'
    }
    if (safe?.startsWith('/admin')) {
      return '/'
    }
    if (safe) return safe
    return '/'
  }

  if (safe) return safe
  return '/'
}
