import { toAbsoluteMediaUrl } from '../runtime-api'

describe('toAbsoluteMediaUrl', () => {
  test('proxies private Vercel Blob URLs for browser display', () => {
    const privateUrl =
      'https://store-id.private.blob.vercel-storage.com/findmiss/u/photo.jpg'
    expect(toAbsoluteMediaUrl(privateUrl)).toMatch(/^\/api\/media\/serve\?url=/)
  })

  test('keeps public blob URLs unchanged', () => {
    const publicUrl = 'https://store-id.public.blob.vercel-storage.com/a.jpg'
    expect(toAbsoluteMediaUrl(publicUrl)).toBe(publicUrl)
  })
})
