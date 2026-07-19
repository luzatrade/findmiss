export async function shareContent({ title, text, url }) {
  if (typeof window === 'undefined') return false

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch (error) {
      if (error?.name === 'AbortError') return false
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

export async function shareProfile(profile) {
  const url = `${window.location.origin}/profile/${profile.id}`
  const title = profile.name || profile.title || 'Profilo Find Miss'
  const text = `Guarda il profilo di ${title} su Find Miss`
  return shareContent({ title, text, url })
}

export async function shareAnnouncement(announcement) {
  const url = `${window.location.origin}/profile/${announcement.id}`
  const title = announcement.title || announcement.stage_name || 'Annuncio Find Miss'
  const text = `Guarda l'annuncio di ${title} su Find Miss`
  return shareContent({ title, text, url })
}
