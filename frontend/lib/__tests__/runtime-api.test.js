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

  test('does not route /api/media through Railway API origin', () => {
    const serve =
      '/api/media/serve?url=https%3A%2F%2Fx.private.blob.vercel-storage.com%2Fa.jpg'
    expect(toAbsoluteMediaUrl(serve)).toBe(serve)
  })

  test('fixes misplaced api host on media serve URLs', () => {
    const broken =
      'https://api.findmiss.it/api/media/serve?url=https%3A%2F%2Fx.private.blob.vercel-storage.com%2Fa.jpg'
    expect(toAbsoluteMediaUrl(broken)).toBe(
      '/api/media/serve?url=https%3A%2F%2Fx.private.blob.vercel-storage.com%2Fa.jpg'
    )
  })
})
