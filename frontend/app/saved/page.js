'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Heart, Trash2, MapPin, Check, Crown, 
  Loader2, Search, X, Grid, List
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function SavedPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      
      // Carica IDs preferiti da localStorage
      const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorites(storedFavorites)
      
      if (storedFavorites.length === 0) {
        setAnnouncements([])
        setLoading(false)
        return
      }

      // Carica dettagli annunci
      const res = await fetch(`${API_URL}/announcements`)
      const data = await res.json()
      
      if (data.success) {
        // Filtra solo i preferiti
        const favAnnouncements = data.data.filter(a => 
          storedFavorites.includes(String(a.id))
        ).map(a => ({
          id: a.id,
          title: a.title || a.stage_name || 'Senza titolo',
          age: a.age || 0,
          city: a.city?.name || 'N/D',
          price: a.price_1hour ? Number(a.price_1hour) : 0,
          verified: a.is_verified || false,
          vip: a.is_vip || false,
          image: a.media?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image',
          category: a.category?.slug || 'miss',
        }))
        setAnnouncements(favAnnouncements)
      }
    } catch (err) {
      console.error('Errore:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (id) => {
    const newFavorites = favorites.filter(f => f !== String(id))
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setFavorites(newFavorites)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const clearAllFavorites = () => {
    if (confirm('Vuoi rimuovere tutti i preferiti?')) {
      localStorage.setItem('favorites', '[]')
      setFavorites([])
      setAnnouncements([])
    }
  }

  // Filtra per ricerca
  const filteredAnnouncements = announcements.filter(a => 
    searchQuery === '' || 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Preferiti</h1>
              <p className="text-xs text-gray-500">{favorites.length} salvati</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
            </button>
            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cerca nei preferiti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-pink-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nessun preferito</h2>
            <p className="text-gray-500 mb-6">Salva i profili che ti interessano per trovarli facilmente</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition"
            >
              Esplora annunci
            </Link>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          /* No Results */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nessun risultato</h2>
            <p className="text-gray-500">Nessun preferito corrisponde a "{searchQuery}"</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAnnouncements.map(announcement => (
              <div key={announcement.id} className="relative group">
                <Link
                  href={`/profile/${announcement.id}`}
                  className="block bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {announcement.verified && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center">
                          <Check size={10} />
                        </span>
                      )}
                      {announcement.vip && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{announcement.title}</h3>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{announcement.age} anni</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} />
                        {announcement.city}
                      </span>
                    </div>
                    <div className="mt-2 text-pink-500 font-bold text-sm">
                      €{announcement.price}/h
                    </div>
                  </div>
                </Link>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeFavorite(announcement.id)
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredAnnouncements.map(announcement => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-pink-300 transition-all flex"
              >
                <Link
                  href={`/profile/${announcement.id}`}
                  className="flex flex-1"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex-shrink-0">
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{announcement.title}</h3>
                      {announcement.verified && (
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full">
                          Verificata
                        </span>
                      )}
                      {announcement.vip && (
                        <span className="bg-amber-100 text-amber-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{announcement.age} anni</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin size={12} />
                        {announcement.city}
                      </span>
                    </div>
                    <div className="mt-2 text-pink-500 font-bold">
                      €{announcement.price}/h
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeFavorite(announcement.id)}
                  className="px-4 flex items-center justify-center text-red-500 hover:bg-red-50 transition border-l border-gray-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

