/** Vercel Blob: token statico oppure OIDC (BLOB_STORE_ID sul deploy Vercel). */
export function isVercelBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

export const BLOB_ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
  'video/3gpp',
  'application/octet-stream',
]

export const BLOB_MAX_SIZE_BYTES = 80 * 1024 * 1024
