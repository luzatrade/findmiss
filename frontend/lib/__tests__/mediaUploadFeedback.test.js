import { buildMediaUploadSuccessMessage, formatMediaUploadError } from '../mediaUploadFeedback'

describe('formatMediaUploadError', () => {
  test('maps session errors', () => {
    expect(formatMediaUploadError(new Error('Sessione non valida'))).toMatch(/Sessione scaduta/)
  })

  test('includes file index in message', () => {
    expect(
      formatMediaUploadError(new Error('Upload failed'), {
        fileName: 'foto.jpg',
        index: 1,
        total: 3,
      })
    ).toContain('2/3')
    expect(
      formatMediaUploadError(new Error('Upload failed'), {
        fileName: 'foto.jpg',
        index: 1,
        total: 3,
      })
    ).toContain('foto.jpg')
  })
})

describe('buildMediaUploadSuccessMessage', () => {
  test('active announcement with photos', () => {
    const msg = buildMediaUploadSuccessMessage({
      count: 2,
      announcementStatus: 'active',
    })
    expect(msg).toMatch(/2 file/)
    expect(msg).toMatch(/visibile sul sito/)
  })

  test('pending announcement', () => {
    const msg = buildMediaUploadSuccessMessage({
      count: 1,
      announcementStatus: 'pending',
    })
    expect(msg).toMatch(/attesa di approvazione/)
  })

  test('reel with feed publish', () => {
    const msg = buildMediaUploadSuccessMessage({
      kind: 'reel',
      count: 1,
      publishedToReels: true,
      announcementStatus: 'active',
    })
    expect(msg).toMatch(/Reel/)
    expect(msg).toMatch(/feed Reels/)
  })
})
