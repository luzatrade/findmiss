import { getApiUrl } from '../lib/runtime-api'
import { SITE_URL } from '../lib/seo'

const staticPaths = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/citta', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/filtri', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/reels', changeFrequency: 'daily', priority: 0.6 },
  { path: '/stories', changeFrequency: 'daily', priority: 0.6 },
  { path: '/policy', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/termini-condizioni.html', changeFrequency: 'yearly', priority: 0.3 },
]

async function fetchActiveAnnouncementIds() {
  const ids = []
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
        if (item?.id != null) ids.push(item.id)
      }

      pages = Number(data.pagination?.pages) || 1
      page += 1
    }
  } catch {
    // Sitemap statica se l'API non è raggiungibile in build
  }

  return [...new Set(ids)]
}

export default async function sitemap() {
  const lastModified = new Date()
  const staticEntries = staticPaths.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))

  const announcementIds = await fetchActiveAnnouncementIds()
  const profileEntries = announcementIds.map((id) => ({
    url: `${SITE_URL}/profile/${id}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticEntries, ...profileEntries]
}
