import { getApiUrl } from '../lib/runtime-api'
import { fetchCitiesForSeo, SITE_URL } from '../lib/seo'
import { getItalianCities } from '../lib/italianCities'

const staticPaths = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/citta', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/filtri', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/reels', changeFrequency: 'daily', priority: 0.6 },
  { path: '/stories', changeFrequency: 'daily', priority: 0.6 },
  { path: '/policy', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/termini-condizioni.html', changeFrequency: 'yearly', priority: 0.3 },
]

async function fetchActiveAnnouncements() {
  const items = []
  const limit = 100
  let page = 1
  let pages = 1

  try {
    while (page <= pages && page <= 50) {
      const res = await fetch(`${getApiUrl()}/announcements?page=${page}&limit=${limit}&sort=recent`, {
        next: { revalidate: 3600 },
      })
      if (!res.ok) break
      const data = await res.json()
      if (!data?.success || !Array.isArray(data.data)) break

      for (const item of data.data) {
        if (item?.id != null) {
          items.push({
            id: item.id,
            updatedAt: item.updated_at || item.created_at || null,
          })
        }
      }

      pages = Number(data.pagination?.pages) || 1
      page += 1
    }
  } catch {
    // Sitemap statica se l'API non è raggiungibile in build
  }

  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export default async function sitemap() {
  const fallbackDate = new Date()
  const staticEntries = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: fallbackDate,
    changeFrequency,
    priority,
  }))

  const citiesFromApi = await fetchCitiesForSeo(200)
  const cities = citiesFromApi.length > 0 ? citiesFromApi : getItalianCities()
  const cityEntries = cities
    .filter((city) => city?.slug)
    .map((city) => ({
      url: `${SITE_URL}/citta/${city.slug}`,
      lastModified: fallbackDate,
      changeFrequency: 'daily',
      priority: 0.8,
    }))

  const announcements = await fetchActiveAnnouncements()
  const profileEntries = announcements.map(({ id, updatedAt }) => ({
    url: `${SITE_URL}/profile/${id}`,
    lastModified: updatedAt ? new Date(updatedAt) : fallbackDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticEntries, ...cityEntries, ...profileEntries]
}
