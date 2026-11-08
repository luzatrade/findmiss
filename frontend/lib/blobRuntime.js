/** Vercel Blob: token statico oppure OIDC (BLOB_STORE_ID su deploy Vercel). */
export function isVercelBlobConfigured() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true
  if (process.env.BLOB_STORE_ID) return true
  if (process.env.VERCEL_ENV) return true
  return false
}
