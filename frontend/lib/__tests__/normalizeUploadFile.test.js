import { inferUploadContentType, withInferredContentType } from '../normalizeUploadFile'

describe('inferUploadContentType', () => {
  test('uses extension when browser type is empty', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.heic', { type: '' })
    expect(inferUploadContentType(file)).toBe('image/heic')
  })

  test('keeps declared type when set', () => {
    const file = new File([new Uint8Array([1])], 'x.bin', { type: 'image/png' })
    expect(inferUploadContentType(file)).toBe('image/png')
  })
})

describe('withInferredContentType', () => {
  test('returns a File with inferred MIME', () => {
    const file = new File([new Uint8Array([1])], 'clip.mov', { type: '' })
    const next = withInferredContentType(file)
    expect(next.type).toBe('video/quicktime')
  })
})
