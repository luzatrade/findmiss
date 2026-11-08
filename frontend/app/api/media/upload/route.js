import { issueSignedToken } from '@vercel/blob'
import { handleUploadPresigned } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import {
  BLOB_ALLOWED_CONTENT_TYPES,
  BLOB_MAX_SIZE_BYTES,
  isVercelBlobConfigured,
} from '../../../../lib/blobRuntime'

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
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {}
        await verifyAuthToken(payload.token)

        const token = await issueSignedToken({
          pathname,
          operations: ['put'],
          allowedContentTypes: BLOB_ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: BLOB_MAX_SIZE_BYTES,
          validUntil: Date.now() + 60 * 60 * 1000,
        })

        return {
          token,
          urlOptions: {
            allowedContentTypes: BLOB_ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: BLOB_MAX_SIZE_BYTES,
            addRandomSuffix: true,
            allowOverwrite: false,
          },
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
