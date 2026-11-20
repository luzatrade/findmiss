const EXTENSION_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  '3gp': 'video/3gpp',
}

export function inferUploadContentType(file) {
  const declared = String(file?.type || '').trim().toLowerCase()
  if (declared && declared !== 'application/octet-stream') {
    return declared
  }

  const name = String(file?.name || '').toLowerCase()
  const match = name.match(/\.([a-z0-9]+)$/i)
  if (match && EXTENSION_MIME[match[1]]) {
    return EXTENSION_MIME[match[1]]
  }

  if (declared) return declared
  return 'application/octet-stream'
}

export function withInferredContentType(file) {
  if (!file) return file
  const contentType = inferUploadContentType(file)
  if (file instanceof File) {
    if (file.type === contentType) return file
    return new File([file], file.name || 'upload', { type: contentType, lastModified: file.lastModified })
  }
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return new File([file], 'upload', { type: contentType })
  }
  return file
}

export function normalizeUploadFile(file, { fallbackBase = 'story' } = {}) {
  if (!file) return null
  if (file instanceof File && file.name) return file

  const isVideo = file.type?.startsWith('video/') || false
  const type = file.type || (isVideo ? 'video/mp4' : 'image/jpeg')
  const name = `${fallbackBase}-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`

  if (file instanceof File) {
    return new File([file], file.name || name, { type })
  }
  if (file instanceof Blob) {
    return new File([file], name, { type })
  }
  return file
}
