'use client';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, MapPin, CheckCircle, ArrowLeft, Search, Sparkles, Users, Video, X } from 'lucide-react';
import { useErrorHandler, ErrorDisplay } from '../../components/ErrorHandler';
import Link from 'next/link';

// Nuove categorie
const CATEGORIES = [
  { id: 'all', name: 'Tutti', icon: Sparkles, color: 'from-pink-500 to-purple-500' },
  { id: 'miss', name: 'Miss', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'mr', name: 'Mr.', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'tmiss', name: 'T-Miss', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
  { id: 'virtual', name: 'Servizi Virtuali', icon: Video, color: 'from-emerald-500 to-teal-500' },
]

const CATEGORY_BADGES = {
  miss: { label: 'Miss', class: 'badge-miss' },
  mr: { label: 'Mr.', class: 'badge-mr' },
  tmiss: { label: 'T-Miss', class: 'badge-tmiss' },
  virtual: { label: 'Virtual', class: 'badge-virtual' },
}

export default function FiltriPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { error, handleError, resetError } = useErrorHandler();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      resetError();
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/announcements`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Errore HTTP! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result && result.success) {
        const transformed = result.data.map(a => ({
          id: a.id,
          title: a.title || a.stage_name || 'Senza titolo',
          description: a.description || '',
          age: a.age || 0,
          city: a.city?.name || 'N/D',
          price: a.price_1hour ? Number(a.price_1hour) : 0,
          verified: a.is_verified || false,
          vip: a.is_vip || false,
          category: a.category?.slug || 'miss',
          image: a.media?.[0]?.url || 'https://via.placeholder.com/300x400?text=No+Image',
        }));
        setAnnouncements(transformed);
      } else {
        throw new Error('Formato dati non valido');
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filtra annunci
  let filteredAnnouncements = [...announcements];
  
  if (selectedCategory !== 'all') {
    filteredAnnouncements = filteredAnnouncements.filter(a => a.category === selectedCategory);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredAnnouncements = filteredAnnouncements.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.city.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Cerca Annunci</h1>
        </div>
      </div>

      <ErrorDisplay 
        error={error} 
        onRetry={fetchAnnouncements}
        onDismiss={resetError}
      />

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cerca per nome, città..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
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

        {/* Results count */}
        <p className="text-gray-500 text-sm">
          {filteredAnnouncements.length} risultat{filteredAnnouncements.length === 1 ? 'o' : 'i'}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAnnouncements.map((announcement) => {
            const badge = CATEGORY_BADGES[announcement.category] || CATEGORY_BADGES.miss;
            return (
              <Link 
                href={`/profile/${announcement.id}`}
                key={announcement.id} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[3/4]">
                  <img 
                    src={announcement.image} 
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Category badge */}
                  <span className={`absolute top-2 left-2 ${badge.class} text-white text-[10px] font-medium px-2 py-1 rounded-full shadow`}>
                    {badge.label}
                  </span>
                  
                  {announcement.verified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center shadow">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verificata
                    </div>
                  )}
                  {announcement.vip && (
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] px-2 py-1 rounded-full font-bold shadow">
                      VIP
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{announcement.title}</h3>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1 text-pink-500" />
                    <span className="truncate">{announcement.city}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold text-pink-500">{announcement.price}€/h</span>
                    <div className="flex space-x-1">
                      <button className="p-1.5 text-gray-400 hover:text-pink-500 transition rounded-full hover:bg-pink-50">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-pink-500 transition rounded-full hover:bg-pink-50">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg mb-2">Nessun risultato</p>
            <p className="text-gray-500 text-sm">Prova a modificare i filtri o la ricerca</p>
          </div>
        )}
      </div>
    </div>
  );
}
