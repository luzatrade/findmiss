'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Search, ChevronRight } from 'lucide-react'
import { getItalianCities, groupCitiesByRegion } from '../../lib/italianCities'

const TOP_CITIES = getItalianCities({ limit: 12 })

export default function CittaPageClient({ groupedRegions = groupCitiesByRegion() }) {
  const [search, setSearch] = useState('')

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return groupedRegions

    return groupedRegions
      .map(({ region, cities }) => ({
        region,
        cities: cities.filter(
          (city) =>
            city.name.toLowerCase().includes(query) ||
            city.slug.includes(query) ||
            (city.region && city.region.toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.cities.length > 0)
  }, [groupedRegions, search])

  const totalCities = groupedRegions.reduce((sum, group) => sum + group.cities.length, 0)
  const visibleCount = filteredGroups.reduce((sum, group) => sum + group.cities.length, 0)

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Annunci per città in Italia</h1>
          <p className="text-sm text-gray-500 mb-4">
            Sfoglia {totalCities} città principali e trova profili disponibili vicino a te.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca città o regione..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {!search && (
          <section aria-label="Città popolari">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Più cercate</h2>
            <div className="flex flex-wrap gap-2">
              {TOP_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/citta/${city.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-pink-300 hover:text-pink-600 transition"
                >
                  <MapPin size={14} />
                  {city.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-label="Elenco città per regione">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {search ? `Risultati (${visibleCount})` : 'Tutte le città per regione'}
          </h2>

          {visibleCount === 0 ? (
            <p className="text-center text-gray-500 py-12">Nessuna città trovata</p>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map(({ region, cities }) => (
                <div key={region} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{region}</h3>
                    <p className="text-xs text-gray-500">{cities.length} città</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/citta/${city.slug}`}
                        className="flex items-center justify-between px-4 py-3.5 hover:bg-pink-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center">
                            <MapPin size={16} className="text-pink-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{city.name}</p>
                            {city.population ? (
                              <p className="text-xs text-gray-500">
                                {city.population.toLocaleString('it-IT')} abitanti
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
