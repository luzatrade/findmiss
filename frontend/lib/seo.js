import { getApiUrl, toAbsoluteMediaUrl } from './runtime-api'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findmiss.it').replace(/\/$/, '')
export const SITE_NAME = 'Find Miss'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`

export const DEFAULT_DESCRIPTION =
  'Find Miss: annunci e profili verificati in Italia. Cerca per città, filtra e scopri miss, reels e storie in tempo reale.'

export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(value = '', max = 155) {
  const text = stripHtml(value)
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trim()}…`
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  noIndex = false,
  type = 'website',
}) {
  const canonical = absoluteUrl(path)
  const ogImage = image ? toAbsoluteMediaUrl(image, undefined, DEFAULT_OG_IMAGE) : DEFAULT_OG_IMAGE
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

  return {
    title: title || SITE_NAME,
    description: truncate(description),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: truncate(description, 200),
      url: canonical,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: truncate(description, 200),
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  }
}

export async function fetchAnnouncementForSeo(id) {
  try {
    const res = await fetch(`${getApiUrl()}/announcements/${id}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.success || !data?.data) return null
    return data.data
  } catch {
    return null
  }
}

export function announcementSeoFields(announcement) {
  const name = announcement.stage_name || announcement.title || 'Profilo'
  const city = announcement.city?.name || announcement.city || null
  const age = announcement.age || null
  const category = announcement.category?.name || 'Miss'
  const titleParts = [name]
  if (age) titleParts.push(`${age} anni`)
  if (city) titleParts.push(city)

  const description =
    announcement.description ||
    `${name}${age ? `, ${age} anni` : ''}${city ? ` a ${city}` : ''}. Annuncio su Find Miss.`

  const image =
    announcement.media?.[0]?.url ||
    announcement.media?.[0]?.thumbnail_url ||
    announcement.images?.[0] ||
    null

  return {
    name,
    city,
    age,
    category,
    title: titleParts.join(' · '),
    description: truncate(description),
    image,
    path: `/profile/${announcement.id}`,
  }
}

export function listingJsonLd(announcement, fields) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fields.name,
    description: fields.description,
    url: absoluteUrl(fields.path),
    ...(fields.image ? { image: toAbsoluteMediaUrl(fields.image) } : {}),
    ...(fields.city
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: fields.city,
            addressCountry: 'IT',
          },
        }
      : {}),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'it-IT',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/filtri?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
