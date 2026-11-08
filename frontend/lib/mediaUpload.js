import { uploadPresigned } from '@vercel/blob/client'
import { getApiUrl } from './runtime-api'
import { normalizeUploadFile } from './normalizeUploadFile'
import { formatMediaUploadError } from './mediaUploadFeedback'

const API_URL = getApiUrl()

const PERSISTENT_MEDIA_ERROR =
  'I file caricati sul server API si perdono a ogni redeploy. Su findmiss.it serve Vercel Blob (Storage collegato al progetto + redeploy). Poi ricarica foto/reel/storie.'

export function isFindMissProduction() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'findmiss.it' || host === 'www.findmiss.it'
}

export function shouldUseVercelBlob() {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_MEDIA_UPLOAD_TARGET === 'railway') return false

  const host = window.location.hostname
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  if (isLocal) {
    return process.env.NEXT_PUBLIC_USE_VERCEL_BLOB === 'true'
  }

  return process.env.NEXT_PUBLIC_USE_VERCEL_BLOB !== 'false'
}

function assertProductionUsesPersistentStorage() {
  if (isFindMissProduction() && !shouldUseVercelBlob()) {
    throw new Error(PERSISTENT_MEDIA_ERROR)
  }
}

async function fetchUserId(token) {
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error('Sessione scaduta, effettua di nuovo l\'accesso')
  }
  return data.data.id
}

function safeFilename(name) {
  return String(name || 'file').replace(/[^\w.-]+/g, '_')
}

async function uploadFileToVercelBlob(token, file) {
  const userId = await fetchUserId(token)
  const folder = file.type?.startsWith('video/') ? 'videos' : 'images'
  const pathname = `findmiss/${userId}/${folder}/${Date.now()}-${safeFilename(file.name)}`

  try {
    const blob = await uploadPresigned(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/media/upload',
      clientPayload: JSON.stringify({ token }),
      multipart: Boolean(file.size && file.size > 4.5 * 1024 * 1024),
    })
    return blob
  } catch (error) {
    if (isFindMissProduction()) {
      throw new Error(
        formatMediaUploadError(
          error?.message?.includes('Blob') ? PERSISTENT_MEDIA_ERROR : error,
          { fileName: file?.name }
        )
      )
    }
    throw new Error(formatMediaUploadError(error, { fileName: file?.name }))
  }
}

function fileToMediaItem(file, blob, { isReel = false } = {}) {
  const isVideo = file.type?.startsWith('video/') || /\.(mp4|mov|webm|m4v|3gp)$/i.test(file.name || '')
  return {
    url: blob.url,
    thumbnail_url: isVideo ? null : blob.url,
    type: isVideo ? 'video' : 'image',
    is_reel: Boolean(isReel && isVideo),
  }
}

async function registerAnnouncementMedia(token, announcementId, items, { isReel = false } = {}) {
  const res = await fetch(`${API_URL}/upload/media/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      announcement_id: announcementId,
      is_reel: isReel,
      items: items.map(({ url, thumbnail_url, type }) => ({
        url,
        thumbnail_url,
        type,
      })),
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(
      formatMediaUploadError(data.error || 'Errore salvataggio media sul database')
    )
  }
  return {
    saved: data.data || [],
    publishedToReels: Boolean(data.published_to_reels),
  }
}

async function uploadViaRailwayMultipart(token, announcementId, files, { isReel = false } = {}) {
  const uploadFormData = new FormData()
  files.forEach((file) => uploadFormData.append('files', file))
  uploadFormData.append('announcement_id', announcementId)
  if (isReel) {
    uploadFormData.append('is_reel', 'true')
  }

  const uploadRes = await fetch(`${API_URL}/upload/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: uploadFormData,
  })
  const uploadData = await uploadRes.json()
  if (!uploadRes.ok || !uploadData.success) {
    throw new Error(uploadData.error || 'Errore nel caricamento foto/video')
  }
  return uploadData.data
}

export async function uploadAnnouncementMediaFiles(token, announcementId, files, options = {}) {
  if (!files?.length) {
    throw new Error('Nessun file selezionato')
  }

  assertProductionUsesPersistentStorage()

  if (shouldUseVercelBlob()) {
    const items = []
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      try {
        const blob = await uploadFileToVercelBlob(token, file)
        items.push(fileToMediaItem(file, blob, options))
      } catch (error) {
        throw new Error(
          formatMediaUploadError(error, {
            fileName: file?.name,
            index,
            total: files.length,
          })
        )
      }
    }
    return registerAnnouncementMedia(token, announcementId, items, options)
  }

  if (isFindMissProduction()) {
    throw new Error(PERSISTENT_MEDIA_ERROR)
  }

  return uploadViaRailwayMultipart(token, announcementId, files, options)
}

export async function uploadPublicMediaFile(token, file) {
  const uploadable = normalizeUploadFile(file, { fallbackBase: 'story' })
  if (!uploadable) {
    throw new Error('File non valido')
  }

  assertProductionUsesPersistentStorage()

  if (shouldUseVercelBlob()) {
    const blob = await uploadFileToVercelBlob(token, uploadable)
    const item = fileToMediaItem(uploadable, blob)
    return {
      url: item.url,
      thumbnail_url: item.thumbnail_url,
      type: item.type,
    }
  }

  if (isFindMissProduction()) {
    throw new Error(PERSISTENT_MEDIA_ERROR)
  }

  const formData = new FormData()
  formData.append('file', uploadable, uploadable.name)

  const uploadRes = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const uploadData = await uploadRes.json()
  if (!uploadData.success) {
    throw new Error(uploadData.error || 'Errore upload')
  }
  return uploadData.data
}

export async function purgeRemoteBlobIfNeeded(token, url) {
  if (!url || typeof url !== 'string' || !url.startsWith('https://')) return

  try {
    await fetch('/api/media/blob', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, token }),
    })
  } catch (error) {
    console.warn('Pulizia blob opzionale fallita:', error)
  }
}
