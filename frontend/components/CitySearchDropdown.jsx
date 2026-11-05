'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { fetchCities } from '../lib/fetchCities'

export default function CitySearchDropdown({
  open,
  query = '',
  onSelect,
  onClose,
  className = '',
}) {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await fetchCities({ search: query, limit: 40 })
        if (!cancelled) setCities(results)
      } catch (error) {
        console.error('Errore caricamento città:', error)
        if (!cancelled) setCities([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, query])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={containerRef}
      className={`absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Caricamento città...
        </div>
      ) : cities.length === 0 ? (
        <p className="px-4 py-6 text-sm text-gray-500 text-center">
          Nessuna città trovata. Prova con un altro nome.
        </p>
      ) : (
        <ul className="py-1">
          {cities.map((city) => (
            <li key={city.id || city.slug}>
              <button
                type="button"
                onClick={() => {
                  onSelect?.(city)
                  onClose?.()
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-pink-50 transition"
              >
                <MapPin size={16} className="text-pink-500 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 truncate">{city.name}</span>
                  {city.region && (
                    <span className="block text-xs text-gray-500 truncate">{city.region}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
