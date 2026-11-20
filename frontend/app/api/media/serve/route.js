import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'

function isAllowedBlobUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return false
    return parsed.hostname.endsWith('.blob.vercel-storage.com')
  } catch {
    return false
  }
}

function accessForUrl(url) {
  return url.includes('.private.blob.vercel-storage.com/') ? 'private' : 'public'
}

export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url || !isAllowedBlobUrl(url)) {
    return NextResponse.json({ error: 'URL media non valido' }, { status: 400 })
  }

  if (accessForUrl(url) === 'public') {
    return NextResponse.redirect(url, 307)
  }

  try {
    const result = await get(url, { access: 'private' })
    if (!result) {
      return NextResponse.json({ error: 'File non trovato' }, { status: 404 })
    }
    if (result.statusCode === 304) {
      return new NextResponse(null, { status: 304 })
    }

    const cacheControl = result.blob.cacheControl || 'public, max-age=3600, s-maxage=86400'
    return new NextResponse(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'Content-Length': String(result.blob.size),
        'Cache-Control': cacheControl,
        ETag: result.blob.etag,
      },
    })
  } catch (error) {
    const message = error?.message || 'Impossibile leggere il file'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
