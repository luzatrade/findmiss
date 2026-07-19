'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, Search, ChevronRight, Loader2 } from 'lucide-react'
import { getApiUrl } from '../../lib/runtime-api'

const API_URL = getApiUrl()

const POPULAR_CITIES = [
  'Milano', 'Roma', 'Napoli', 'Torino', 'Firenze', 'Bologna',
  'Palermo', 'Genova', 'Verona', 'Bari', 'Catania', 'Venezia',
]

export default function CittaPage() {
  const [search, setSearch] = useState('')
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCities = useCallback(async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '30' })
      if (query.trim()) params.set('search', query.trim())
      const res = await fetch(`${API_URL}/cities?${params}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setCities(data.data)
      } else {
        throw new Error('Dati città non validi')
      }
    } catch {
      setError('Impossibile caricare le città. Prova le città popolari qui sotto.')
      setCities(
        POPULAR_CITIES.map((name, index) => ({
          id: index + 1,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchCities(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchCities])

  const cityHref = (city) => `/filtri?city=${encodeURIComponent(city.name)}`

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Annunci per città</h1>
          <p className="text-sm text-gray-500 mb-4">Scegli una città per vedere i profili disponibili</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca città..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!search && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Popolari</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.map((name) => (
                <Link
                  key={name}
                  href={`/filtri?city=${encodeURIComponent(name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-pink-300 hover:text-pink-600 transition"
                >
                  <MapPin size={14} />
                  {name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {search ? 'Risultati' : 'Tutte le città'}
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : cities.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Nessuna città trovata</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {cities.map((city) => (
                <Link
                  key={city.id || city.slug || city.name}
                  href={cityHref(city)}
                  className="flex items-center justify-between px-4 py-4 hover:bg-pink-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <MapPin size={18} className="text-pink-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{city.name}</p>
                      {city.region && <p className="text-xs text-gray-500">{city.region}</p>}
                      {city.announcements_count != null && (
                        <p className="text-xs text-pink-500 mt-0.5">{city.announcements_count} annunci</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
