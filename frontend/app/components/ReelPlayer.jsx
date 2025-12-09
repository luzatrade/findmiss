'use client'
import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown, X, Phone } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ReelPlayer({ reel, onNext, onPrev, onClose, isActive }) {
  const [liked, setLiked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const watchTimeRef = useRef(0)
  const watchIntervalRef = useRef(null)

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(console.error)
      setIsPlaying(true)
      
      // Traccia watch time
      watchIntervalRef.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          watchTimeRef.current += 1
        }
      }, 1000)
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
      }
    }

    return () => {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current)
      }
    }
  }, [isActive])

  // Registra visualizzazione
  useEffect(() => {
    if (isActive && reel) {
      fetch(`${API_URL}/reels/${reel.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watch_time: watchTimeRef.current })
      }).catch(console.error)
    }
  }, [isActive, reel])

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/reels/${reel.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })
      
      if (response.ok) {
        setLiked(!liked)
      }
    } catch (error) {
      console.error('Errore like:', error)
    }
  }

  const handleCall = () => {
    const phone = reel.user?.phone || '+39 333 1234567'
    window.location.href = `tel:${phone}`
  }

  const handleChat = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Devi effettuare il login per usare la chat')
      window.location.href = '/menu'
      return
    }
    window.location.href = `/announcements/${reel.id}?action=chat`
  }

  const handleWhatsApp = () => {
    const phone = (reel.user?.phone || '+393331234567').replace(/\s/g, '')
    const message = encodeURIComponent(`Ciao, sono interessato al tuo annuncio: ${reel.title || reel.stage_name}`)
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  if (!reel || !reel.video) return null

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video.url}
        className="w-full h-full object-cover"
        loop
        muted={false}
        playsInline
        onClick={() => {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play()
              setIsPlaying(true)
            } else {
              videoRef.current.pause()
              setIsPlaying(false)
            }
          }
        }}
      />

      {/* Overlay info compatto - stile Instagram */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="flex items-end justify-between">
          {/* Info sinistra - compatta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-white font-bold text-sm truncate">{reel.stage_name || reel.title}</h3>
              {reel.is_verified && (
                <span className="bg-blue-500 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0">✓</span>
              )}
              {reel.premium_level === 'vip' && (
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0">VIP</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              {reel.age && <span>{reel.age} anni</span>}
              {reel.city && (
                <>
                  {reel.age && <span>•</span>}
                  <span className="truncate">{reel.city.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Azioni destra - compatte */}
          <div className="flex flex-col items-center gap-2.5 ml-3 flex-shrink-0">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-0.5 ${
                liked ? 'text-red-500' : 'text-white'
              } active:scale-95 transition-transform`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                liked ? 'bg-red-500/20' : 'bg-black/40'
              }`}>
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-[10px] font-semibold">{reel.likes_count || 0}</span>
            </button>

            <button
              onClick={handleCall}
              className="flex flex-col items-center gap-0.5 text-white active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-green-600/30 flex items-center justify-center">
                <Phone size={18} />
              </div>
              <span className="text-[10px] font-semibold">Chiama</span>
            </button>

            <button
              onClick={handleChat}
              className="flex flex-col items-center gap-0.5 text-white active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600/30 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <span className="text-[10px] font-semibold">Chat</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-0.5 text-white active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366]/30 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[10px] font-semibold">WA</span>
            </button>

            <button className="flex flex-col items-center gap-0.5 text-white active:scale-95 transition-transform">
              <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
                <Share2 size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pulsanti navigazione - nascosti, gestiti dalla pagina */}

      {/* Pulsante chiusura */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition z-10"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}


