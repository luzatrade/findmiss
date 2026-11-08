import { del } from '@vercel/blob'
import { NextResponse } from 'next/server'

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
}

function isVercelBlobUrl(url) {
  try {
    const { hostname } = new URL(url)
    return hostname.endsWith('blob.vercel-storage.com')
  } catch {
    return false
  }
}

export async function DELETE(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ success: false, skipped: true })
  }

  try {
    const { url, token } = await request.json()
    await verifyAuthToken(token)

    if (!url || !isVercelBlobUrl(url)) {
      return NextResponse.json({ success: true, skipped: true })
    }

    await del(url)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Eliminazione fallita' }, { status: 400 })
  }
}
