'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, MapPin, Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function CitySelector({ isOpen, onClose, onSelectCity }) {
  const [search, setSearch] = useState('')
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)

  // Autocomplete con debounce
  const fetchCities = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setCities([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/cities?search=${encodeURIComponent(query)}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setCities(data.data)
      }
    } catch (error) {
      console.error('Errore fetch città:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCities(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, fetchCities])

  // Carica città popolari all'apertura
  useEffect(() => {
    if (isOpen && !search) {
      fetchCities('')
    }
  }, [isOpen, search, fetchCities])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Seleziona città</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-white">
            <X size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca città..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 text-white pl-12 pr-4 py-4 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-lg">Caricamento...</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-lg">Nessuna città trovata</p>
            <p className="text-sm text-gray-600 mt-2">Prova a cercare una città</p>
          </div>
        ) : (
          cities.map(city => (
            <button
              key={city.id}
              onClick={() => {
                setSelectedCity(city)
                onSelectCity(city)
                // Salva in sessione
                if (typeof window !== 'undefined') {
                  const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`
                  localStorage.setItem('session_id', sessionId)
                  fetch(`${API_URL}/sessions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      session_id: sessionId,
                      city_id: city.id
                    })
                  }).catch(console.error)
                }
                onClose()
              }}
              className={`w-full px-6 py-5 hover:bg-gray-900 border-b border-gray-800 text-left transition-colors flex items-center gap-4 ${
                selectedCity?.id === city.id ? 'bg-purple-600/10' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <MapPin size={24} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">{city.name}</div>
                {city.region && (
                  <div className="text-gray-400 text-sm">{city.region}</div>
                )}
                {city.announcements_count !== undefined && (
                  <div className="text-purple-400 text-xs mt-1">
                    {city.announcements_count} annunci
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
