import { getApiUrl } from './runtime-api'
import { uploadAnnouncementMediaFiles, purgeRemoteBlobIfNeeded } from './mediaUpload'

const API_URL = getApiUrl()

export async function uploadReelToAnnouncement(token, announcementId, videoFile) {
  return uploadAnnouncementMediaFiles(token, announcementId, [videoFile], { isReel: true })
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

  const deleted = data.deleted || {}
  await purgeRemoteBlobIfNeeded(token, deleted.url)
  if (deleted.thumbnail_url && deleted.thumbnail_url !== deleted.url) {
    await purgeRemoteBlobIfNeeded(token, deleted.thumbnail_url)
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
