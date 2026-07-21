import { getApiUrl, toAbsoluteMediaUrl } from './runtime-api'
import { getItalianCities, getItalianCityBySlug } from './italianCities'

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
  keywords = [],
}) {
  const canonical = absoluteUrl(path)
  const ogImage = image ? toAbsoluteMediaUrl(image, undefined, DEFAULT_OG_IMAGE) : DEFAULT_OG_IMAGE
  const pageTitle = title || SITE_NAME
  const fullTitle = pageTitle === SITE_NAME ? SITE_NAME : `${pageTitle} | ${SITE_NAME}`

  return {
    title: pageTitle === SITE_NAME ? { absolute: SITE_NAME } : pageTitle,
    description: truncate(description),
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: truncate(description, 200),
      url: canonical,
      siteName: SITE_NAME,
      locale: 'it_IT',
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: truncate(description, 200),
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export async function fetchCitiesForSeo(limit = 200) {
  try {
    const res = await fetch(`${getApiUrl()}/cities?limit=${limit}`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return getItalianCities({ limit })
    const data = await res.json()
    if (!data?.success || !Array.isArray(data.data) || data.data.length === 0) {
      return getItalianCities({ limit })
    }
    return data.data
  } catch {
    return getItalianCities({ limit })
  }
}

export async function fetchCityForSeo(slug) {
  try {
    const res = await fetch(`${getApiUrl()}/cities/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return getItalianCityBySlug(slug)
    const data = await res.json()
    if (!data?.success || !data?.data) return getItalianCityBySlug(slug)
    return data.data
  } catch {
    return getItalianCityBySlug(slug)
  }
}

export function citySeoFields(city) {
  const name = city.name || city.slug
  const slug = city.slug || String(name).toLowerCase()
  return {
    name,
    slug,
    title: `Annunci a ${name}`,
    description: `Scopri annunci e profili a ${name}${city.region ? ` (${city.region})` : ''} su Find Miss. Filtra per categoria, prezzo e disponibilità in tempo reale.`,
    path: `/citta/${slug}`,
    keywords: [
      `annunci ${name}`,
      `incontri ${name}`,
      `profili ${name}`,
      `miss ${name}`,
      city.region || 'Italia',
      'Find Miss',
    ],
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
    '@type': 'ProfilePage',
    name: fields.title,
    description: fields.description,
    url: absoluteUrl(fields.path),
    mainEntity: {
      '@type': 'Person',
      name: fields.name,
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
    },
  }
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
  }
}

export function cityListingJsonLd(cityName, slug, announcementUrls = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Annunci a ${cityName}`,
    description: `Elenco annunci e profili disponibili a ${cityName} su Find Miss.`,
    url: absoluteUrl(`/citta/${slug}`),
    inLanguage: 'it-IT',
    ...(announcementUrls.length > 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: announcementUrls.slice(0, 20).map((url, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(url),
            })),
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
