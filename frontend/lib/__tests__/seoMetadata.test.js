import { faqJsonLd, filtriMetadataFromSearchParams } from '../seo'
import { SITE_FAQ } from '../siteFaq'

describe('faqJsonLd', () => {
  test('builds FAQPage schema from site faq', () => {
    const ld = faqJsonLd(SITE_FAQ)
    expect(ld['@type']).toBe('FAQPage')
    expect(ld.mainEntity.length).toBe(SITE_FAQ.length)
  })
})

describe('filtriMetadataFromSearchParams', () => {
  test('indexes clean /filtri', () => {
    const meta = filtriMetadataFromSearchParams({})
    expect(meta.robots.index).toBe(true)
    expect(meta.alternates.canonical).toContain('/filtri')
  })

  test('noindexes faceted city search', () => {
    const meta = filtriMetadataFromSearchParams({ city: 'Milano' })
    expect(meta.robots.index).toBe(false)
    expect(meta.title).toMatch(/Milano/)
  })
})