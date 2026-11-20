import { readFileSync } from 'fs'
import { join } from 'path'

describe('media upload route', () => {
  const routeSource = readFileSync(join(__dirname, '..', 'upload', 'route.js'), 'utf8')
  const blobSource = readFileSync(join(__dirname, '..', 'blob', 'route.js'), 'utf8')

  test('resolves blobRuntime from the frontend lib folder (four levels up)', () => {
    expect(routeSource).toContain("from '../../../../lib/blobRuntime'")
    expect(blobSource).toContain("from '../../../../lib/blobRuntime'")
    expect(routeSource).not.toContain("from '../../../lib/blobRuntime'")
    expect(blobSource).not.toContain("from '../../../lib/blobRuntime'")
  })

  test('uses OIDC-compatible presigned uploads instead of handleUpload', () => {
    expect(routeSource).toContain("from '@vercel/blob/client'")
    expect(routeSource).toContain('handleUploadPresigned')
    expect(routeSource).toContain('issueSignedToken')
    expect(routeSource).not.toContain('handleUpload({')
  })
})
