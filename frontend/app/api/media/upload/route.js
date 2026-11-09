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

  let profileRes
  try {
    profileRes = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
  } catch {
    throw new Error('Server API non raggiungibile. Riprova tra qualche secondo.')
  }

  const profileData = await profileRes.json().catch(() => ({}))
  if (profileRes.status >= 500) {
    throw new Error('Server API temporaneamente non disponibile. Riprova tra qualche secondo.')
  }
  if (!profileRes.ok || !profileData.success) {
    throw new Error('Sessione non valida. Effettua di nuovo l\'accesso.')
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

        const validUntil = Date.now() + 60 * 60 * 1000
        const issued = await issueSignedToken({
          pathname,
          operations: ['put'],
          validUntil,
          maximumSizeInBytes: BLOB_MAX_SIZE_BYTES,
        })

        return {
          token: issued,
          urlOptions: {
            allowedContentTypes: BLOB_ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: BLOB_MAX_SIZE_BYTES,
            validUntil,
            addRandomSuffix: true,
            allowOverwrite: false,
          },
        }
      },
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
