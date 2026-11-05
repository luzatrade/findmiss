import { getApiUrl } from './runtime-api'

const API_URL = getApiUrl()

export async function uploadReelToAnnouncement(token, announcementId, videoFile) {
  const formData = new FormData()
  formData.append('files', videoFile)
  formData.append('announcement_id', announcementId)
  formData.append('is_reel', 'true')

  const res = await fetch(`${API_URL}/upload/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Errore upload reel')
  }
  return data.data
}

export async function deleteReelMedia(token, mediaId) {
  const res = await fetch(`${API_URL}/upload/media/${mediaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Errore eliminazione reel')
  }
  return data
}

export async function fetchMyAnnouncements(token) {
  const res = await fetch(`${API_URL}/announcements/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Errore caricamento annunci')
  }
  return data.data || []
}
