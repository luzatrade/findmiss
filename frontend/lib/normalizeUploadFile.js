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
