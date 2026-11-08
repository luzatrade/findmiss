import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { isVercelBlobConfigured } from '../../../lib/blobRuntime'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.findmiss.it/api').replace(/\/$/, '')

async function verifyAuthToken(token) {
  if (!token) {
    throw new Error('Accesso richiesto')
  }

  const profileRes = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const profileData = await profileRes.json()
  if (!profileRes.ok || !profileData.success) {
    throw new Error('Sessione non valida')
  }
  return profileData.data
}

export async function POST(request) {
  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {}
        await verifyAuthToken(payload.token)

        return {
          allowedContentTypes: [
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
          ],
          maximumSizeInBytes: 80 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    const message = error?.message || 'Upload non riuscito'
    if (!isVercelBlobConfigured()) {
      return NextResponse.json(
        {
          error:
            'Vercel Blob non configurato: collega uno store Blob al progetto findmiss (Storage → Connect) e redeploy.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
