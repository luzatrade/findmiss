'use client'
import { useState, useEffect } from 'react'

import { MapPin, Search, Heart, Check, X, Sparkles, Users, Video } from 'lucide-react'
import Link from 'next/link'
import CitySelector from '../components/CitySelector'
import AdvancedFilters from '../components/AdvancedFilters'
import UserMenu from '../components/UserMenu'
import NotificationsBell from './components/NotificationsBell'
import StoriesBar from './components/StoriesBar'
import { LogoLight } from './components/Logo'

// Nuove categorie
const CATEGORIES = [
  { id: 'all', name: 'Tutti', icon: Sparkles, color: 'from-pink-500 to-purple-500' },
  { id: 'miss', name: 'Miss', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'mr', name: 'Mr.', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'tmiss', name: 'T-Miss', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
  { id: 'virtual', name: 'Servizi Virtuali', icon: Video, color: 'from-emerald-500 to-teal-500' },
]

export default function HomePage() {
  const [showCityModal, setShowCityModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filters, setFilters] = useState(null)
  const [favoritesFilter, setFavoritesFilter] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState([])
  const [isGeoLoading, setIsGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = JSON.parse(window.localStorage.getItem('favorites') || '[]')
      setFavoriteIds(stored)
    } catch {
      setFavoriteIds([])
    }
  }, [])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const res = await fetch(`${API_URL}/announcements`)
        if (!res.ok) {
          throw new Error('Errore nel caricamento degli annunci')
        }
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          // Trasforma i dati dal backend al formato frontend
          const transformed = json.data.map(a => ({
            id: a.id,
            title: a.title || a.stage_name || 'Senza titolo',
            age: a.age || 0,
            city: a.city?.name || 'N/D',
            price: a.price_1hour ? Number(a.price_1hour) : 0,
            verified: a.is_verified || false,
            vip: a.is_vip || false,
            availableNow: a.is_available_now || false,
            image: a.media?.[0]?.url || a.media?.[0]?.thumbnail_url || 'https://via.placeholder.com/300x400?text=No+Image',
            hairColor: a.hair_color,
            eyeColor: a.eye_color,
            cupSize: a.cup_size,
            category: a.category?.slug || 'miss',
            services: a.services ? (typeof a.services === 'string' ? JSON.parse(a.services) : a.services) : null
          }))
          setAnnouncements(transformed)
        } else {
          setAnnouncements([])
        }
      } catch (err) {
        console.error('Errore fetch:', err)
        setLoadError('Impossibile caricare gli annunci, riprova più tardi')
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  const guessCityFromCoords = (lat, lng) => {
    if (!lat || !lng) return null
    if (lat > 45 && lat < 46 && lng > 9 && lng < 10) return { name: 'Milano' }
    if (lat > 41 && lat < 42 && lng > 12 && lng < 13) return { name: 'Roma' }
    if (lat > 40 && lat < 41 && lng > 14 && lng < 15) return { name: 'Napoli' }
    return null
  }

  const handleUseGeolocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocalizzazione non supportata dal browser')
      return
    }
    setIsGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const guessed = guessCityFromCoords(latitude, longitude)
        if (guessed) {
          setSelectedCity(guessed)
        } else {
          setGeoError('Non riesco a determinare la città, selezionala manualmente')
        }
        setIsGeoLoading(false)
      },
      () => {
        setIsGeoLoading(false)
        setGeoError('Permesso posizione negato o non disponibile')
      }
    )
  }

  // Applica filtri
  let filteredAnnouncements = [...announcements]

  // Filtro categoria
  if (selectedCategory && selectedCategory !== 'all') {
    filteredAnnouncements = filteredAnnouncements.filter(a => a.category === selectedCategory)
  }

  // Filtro città
  if (selectedCity) {
    filteredAnnouncements = filteredAnnouncements.filter(a => a.city === selectedCity.name)
  }

  // Filtri avanzati
  if (filters && Object.keys(filters).length > 0) {
    if (filters.city) {
      filteredAnnouncements = filteredAnnouncements.filter(a => 
        a.city && a.city.toLowerCase() === filters.city.toLowerCase()
      )
    }
    if (filters.verified) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.verified)
    }
    if (filters.vip) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.vip)
    }
    if (filters.availableNow) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.availableNow)
    }
    if (filters.ageMin || filters.ageMax) {
      filteredAnnouncements = filteredAnnouncements.filter(a => 
        a.age >= (filters.ageMin || 0) && 
        a.age <= (filters.ageMax || 100)
      )
    }
    if (filters.priceMin || filters.priceMax) {
      filteredAnnouncements = filteredAnnouncements.filter(a => 
        a.price >= (filters.priceMin || 0) && 
        a.price <= (filters.priceMax || 10000)
      )
    }
    if (filters.hairColor) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.hairColor === filters.hairColor)
    }
    if (filters.eyeColor) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.eyeColor === filters.eyeColor)
    }
    if (filters.cupSize) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.cupSize === filters.cupSize)
    }
    if (filters.bodyType) {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.bodyType === filters.bodyType)
    }
    if (filters.services) {
      Object.entries(filters.services).forEach(([service, isActive]) => {
        if (isActive) {
          filteredAnnouncements = filteredAnnouncements.filter(a => a.services && a.services[service])
        }
      })
    }
  }

  // Filtro preferiti
  if (favoritesFilter && favoriteIds.length > 0) {
    filteredAnnouncements = filteredAnnouncements.filter((a) => favoriteIds.includes(String(a.id)))
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <LogoLight size="sm" />
          <div className="hidden sm:flex items-center gap-2">
            {selectedCity && (
              <div className="flex items-center gap-2 bg-pink-100 text-pink-600 px-3 py-1.5 rounded-full border border-pink-200">
                <MapPin size={16} />
                <span className="text-sm font-medium">{selectedCity.name}</span>
                <button onClick={() => setSelectedCity(null)} className="ml-1 hover:text-pink-800">
                  <X size={14} />
                </button>
              </div>
            )}
            {filters && (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full border border-purple-200">
                <Search size={16} />
                <span className="text-sm font-medium">{filters.city || 'Filtri attivi'}</span>
                <button onClick={() => setFilters(null)} className="ml-1 hover:text-purple-800">
                  <X size={14} />
                </button>
              </div>
            )}
            <NotificationsBell />
          </div>
        </div>
      </div>

      {/* Stories */}
      <StoriesBar />

      {/* Main Content */}
      <div className="pb-24">
        <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cerca città, nome, servizi..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowFiltersModal(true)}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                filters 
                  ? 'border-pink-500 text-pink-600 bg-pink-50' 
                  : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Search size={18} />
              Filtri
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs hide-scrollbar">
            <button
              onClick={() => setShowCityModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border transition whitespace-nowrap ${
                selectedCity
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <MapPin size={14} />
              {selectedCity ? selectedCity.name : 'Scegli città'}
            </button>

            <button
              onClick={handleUseGeolocation}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border transition whitespace-nowrap ${
                isGeoLoading
                  ? 'bg-pink-100 text-pink-600 border-pink-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {isGeoLoading ? (
                <span className="w-3 h-3 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              ) : (
                <MapPin size={14} />
              )}
              {isGeoLoading ? 'Localizzo...' : 'Vicino a me'}
            </button>

            <button
              onClick={() => setShowFiltersModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border transition whitespace-nowrap ${
                filters 
                  ? 'bg-purple-100 text-purple-600 border-purple-200' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Search size={14} />
              Filtri avanzati
            </button>

            <button
              onClick={() => setFavoritesFilter((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border whitespace-nowrap transition ${
                favoritesFilter
                  ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Heart size={14} />
              Preferiti
            </button>
          </div>

          {geoError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {geoError}
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-20 px-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-red-600 text-sm mb-2">{loadError}</p>
              <p className="text-gray-500 text-xs">Controlla la connessione o il server backend (porta 3001).</p>
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg mb-2">Nessun annuncio trovato</p>
            <p className="text-gray-500 text-sm mb-4">Prova a modificare i filtri</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {selectedCategory !== 'all' && (
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="text-pink-500 hover:text-pink-600 underline text-sm"
                >
                  Mostra tutte le categorie
                </button>
              )}
              {selectedCity && (
                <button 
                  onClick={() => setSelectedCity(null)}
                  className="text-pink-500 hover:text-pink-600 underline text-sm"
                >
                  Rimuovi città
                </button>
              )}
              {filters && (
                <button 
                  onClick={() => setFilters(null)}
                  className="text-pink-500 hover:text-pink-600 underline text-sm"
                >
                  Rimuovi filtri
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAnnouncements.map((announcement) => (
                <Link
                  href={`/profile/${announcement.id}`}
                  key={announcement.id}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {announcement.verified && (
                          <span className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center shadow">
                            <Check className="w-3 h-3 mr-1" /> Verificata
                          </span>
                        )}
                        {announcement.vip && (
                          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] px-2 py-1 rounded-full font-bold shadow">
                            VIP
                          </span>
                        )}
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-2 left-2">
                        {announcement.category === 'miss' && (
                          <span className="badge-miss text-white text-[10px] px-2 py-1 rounded-full font-medium shadow">Miss</span>
                        )}
                        {announcement.category === 'mr' && (
                          <span className="badge-mr text-white text-[10px] px-2 py-1 rounded-full font-medium shadow">Mr.</span>
                        )}
                        {announcement.category === 'tmiss' && (
                          <span className="badge-tmiss text-white text-[10px] px-2 py-1 rounded-full font-medium shadow">T-Miss</span>
                        )}
                        {announcement.category === 'virtual' && (
                          <span className="badge-virtual text-white text-[10px] px-2 py-1 rounded-full font-medium shadow">Virtual</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{announcement.age} anni</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {announcement.city}
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-pink-500 font-bold text-sm">
                          {announcement.price}€/h
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Heart size={11} />
                          120
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CitySelector 
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
        onSelectCity={setSelectedCity}
      />

      <AdvancedFilters
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApply={setFilters}
      />

      <UserMenu
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
      />

    </div>
  )
}
