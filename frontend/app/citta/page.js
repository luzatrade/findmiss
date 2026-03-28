'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, CheckCircle, MapPin } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { getApiUrl, getApiOrigin, toAbsoluteMediaUrl } from '../../lib/runtime-api';
import { FALLBACK_ANNOUNCEMENTS } from '../../lib/fallback-announcements';

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadWarning, setLoadWarning] = useState(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const apiUrl = getApiUrl();
      const apiOrigin = getApiOrigin();
      setLoadWarning(null);
      const res = await fetch(`${apiUrl}/announcements`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const transformed = data.data.map((item) => ({
          id: item.id,
          stage_name: item.stage_name || item.title || 'Profilo',
          title: item.title || item.stage_name || 'Profilo',
          description: item.description || '',
          age: item.age || 0,
          city: { name: item.city?.name || 'N/D' },
          price_1hour: item.price_1hour ? Number(item.price_1hour) : 0,
          is_verified: item.is_verified || false,
          premium_level: item.is_vip ? 'vip' : 'standard',
          is_available_now: item.is_available_now || false,
          media: [{ url: toAbsoluteMediaUrl(item.media?.[0]?.url || item.media?.[0]?.thumbnail_url, apiOrigin) }],
          likes_count: item.likes_count || 0,
        }));
        setReels(transformed);
      } else {
        throw new Error('Formato dati annunci non valido');
      }
    } catch (error) {
      console.error('Errore caricamento reels:', error);
      setLoadWarning('Backend non disponibile al momento: mostro contenuti demo');
      const fallbackReels = FALLBACK_ANNOUNCEMENTS.map((item) => ({
        id: item.id,
        stage_name: item.stage_name || item.title,
        title: item.title,
        description: item.description || '',
        age: item.age,
        city: { name: item.city },
        price_1hour: item.price_1hour || item.price || 0,
        is_verified: item.is_verified || item.verified || false,
        premium_level: item.is_vip || item.vip ? 'vip' : 'standard',
        is_available_now: item.is_available_now || item.availableNow || false,
        media: [{ url: item.image }],
        likes_count: item.likes_count || 0,
      }));
      setReels(fallbackReels);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    setReels(prev => prev.map(reel => 
      reel.id === id ? { ...reel, likes_count: reel.likes_count + 1 } : reel
    ));
  };

  const nextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Nessun reel disponibile
        <BottomNav />
      </div>
    );
  }

  const reel = reels[currentIndex];
  const imageUrl = reel.media?.[0]?.url || 'https://picsum.photos/400/800';

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      {loadWarning && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <p className="text-xs text-amber-200 bg-amber-900/70 border border-amber-700 rounded-lg px-3 py-2 backdrop-blur">
            {loadWarning}
          </p>
        </div>
      )}

      {/* Area cliccabile per navigare */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full" onClick={prevReel}></div>
        <div className="w-1/2 h-full" onClick={nextReel}></div>
      </div>

      {/* Immagine di sfondo */}
      <img
        src={imageUrl}
        alt={reel.title}
        className="h-full w-full object-cover"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>

      {/* Indicatore posizione */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full ${index === currentIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
          ></div>
        ))}
      </div>

      {/* Pulsanti azioni (destra) */}
      <div className="absolute right-3 bottom-40 flex flex-col items-center gap-6">
        <button 
          onClick={() => handleLike(reel.id)}
          className="flex flex-col items-center"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <Heart size={28} className="text-white" />
          </div>
          <span className="text-white text-xs mt-1">{reel.likes_count}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <MessageCircle size={28} className="text-white" />
          </div>
          <span className="text-white text-xs mt-1">Chat</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
            <Share2 size={28} className="text-white" />
          </div>
          <span className="text-white text-xs mt-1">Share</span>
        </button>
      </div>

      {/* Info annuncio (sinistra/basso) */}
      <div className="absolute left-4 bottom-40 right-20">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-white font-bold text-xl">
            {reel.stage_name || reel.title}
          </h2>
          {reel.is_verified && (
            <CheckCircle size={18} className="text-blue-500 fill-blue-500" />
          )}
          {reel.premium_level === 'vip' && (
            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">VIP</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-white/80 text-sm mb-2">
          <span>{reel.age} anni</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{reel.city?.name}</span>
          </div>
        </div>

        <p className="text-white/70 text-sm mb-3">
          {reel.description}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-pink-500 font-bold text-lg">€{reel.price_1hour}/h</span>
          {reel.is_available_now && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Disponibile ora</span>
          )}
        </div>
      </div>

      {/* Pulsante Contatta */}
      <div className="absolute bottom-20 left-4 right-4">
        <button className="w-full bg-pink-500 text-white font-bold py-3 rounded-full hover:bg-pink-600 transition-colors">
          Contatta
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
