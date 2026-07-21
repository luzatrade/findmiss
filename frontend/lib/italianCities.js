import cities from './italian-cities.json'

export const ITALIAN_CITIES = cities

export function getItalianCities(options = {}) {
  const search = options.search ? String(options.search).trim().toLowerCase() : ''
  const region = options.region ? String(options.region).trim().toLowerCase() : ''
  const limit = Number.parseInt(options.limit, 10)
  const take = Number.isFinite(limit) && limit > 0 ? limit : ITALIAN_CITIES.length

  let items = ITALIAN_CITIES.filter((city) => city.slug && city.name)

  if (search) {
    items = items.filter(
      (city) =>
        city.name.toLowerCase().includes(search) ||
        city.slug.includes(search) ||
        (city.region && city.region.toLowerCase().includes(search))
    )
  }

  if (region) {
    items = items.filter((city) => city.region && city.region.toLowerCase() === region)
  }

  return items
    .slice()
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, take)
}

export function getItalianCityBySlug(slug) {
  const normalized = String(slug || '').trim().toLowerCase()
  return ITALIAN_CITIES.find((item) => item.slug === normalized) || null
}

export function getItalianRegions() {
  const regions = new Set(ITALIAN_CITIES.map((city) => city.region).filter(Boolean))
  return Array.from(regions).sort((a, b) => a.localeCompare(b, 'it'))
}

export function groupCitiesByRegion(citiesList = ITALIAN_CITIES) {
  const grouped = new Map()

  for (const city of citiesList) {
    const region = city.region || 'Altro'
    if (!grouped.has(region)) grouped.set(region, [])
    grouped.get(region).push(city)
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'it'))
    .map(([region, items]) => ({
      region,
      cities: items.sort((a, b) => (b.population || 0) - (a.population || 0)),
    }))
}
