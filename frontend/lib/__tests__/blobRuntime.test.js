import { isVercelBlobConfigured } from '../blobRuntime'

describe('isVercelBlobConfigured', () => {
  const originalRw = process.env.BLOB_READ_WRITE_TOKEN
  const originalStore = process.env.BLOB_STORE_ID
  const originalVercelEnv = process.env.VERCEL_ENV

  afterEach(() => {
    if (originalRw === undefined) delete process.env.BLOB_READ_WRITE_TOKEN
    else process.env.BLOB_READ_WRITE_TOKEN = originalRw
    if (originalStore === undefined) delete process.env.BLOB_STORE_ID
    else process.env.BLOB_STORE_ID = originalStore
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = originalVercelEnv
  })

  test('is false without blob credentials, even on Vercel', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_STORE_ID
    process.env.VERCEL_ENV = 'production'
    expect(isVercelBlobConfigured()).toBe(false)
  })

  test('is true with BLOB_STORE_ID (OIDC connection)', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    process.env.BLOB_STORE_ID = 'store_l4riVElCq9X7E87V'
    expect(isVercelBlobConfigured()).toBe(true)
  })

  test('is true with BLOB_READ_WRITE_TOKEN', () => {
    delete process.env.BLOB_STORE_ID
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test'
    expect(isVercelBlobConfigured()).toBe(true)
  })
})
