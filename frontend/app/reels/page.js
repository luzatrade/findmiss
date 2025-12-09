'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX,
  Play, Pause, ChevronUp, ChevronDown, X, Phone, User, Check,
  MapPin, Eye, Crown, Radio
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ReelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startIndex = parseInt(searchParams.get('start') || '0')
  
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(null)
  const [showComments, setShowComments] = useState(false)
  
  const containerRef = useRef(null)
  const videoRefs = useRef({})

  useEffect(() => {
    loadReels()
  }, [])

  useEffect(() => {
    // Pausa video precedenti, riproduci corrente
    Object.keys(videoRefs.current).forEach(index => {
      const video = videoRefs.current[index]
      if (video) {
        if (parseInt(index) === currentIndex) {
          if (isPlaying) video.play().catch(() => {})
        } else {
          video.pause()
          video.currentTime = 0
        }
      }
    })

    // Track view
    if (reels[currentIndex]) {
      trackView(reels[currentIndex].id)
    }
  }, [currentIndex, isPlaying])

  const loadReels = async () => {
    try {
      const res = await fetch(`${API_URL}/reels?limit=50`)
      const data = await res.json()
      if (data.success) {
        setReels(data.data || [])
      }
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const trackView = async (reelId) => {
    try {
      await fetch(`${API_URL}/reels/${reelId}/view`, { method: 'POST' })
    } catch (error) {
      // Silently fail
    }
  }

  const goToReel = useCallback((index) => {
    if (index >= 0 && index < reels.length) {
      setCurrentIndex(index)
    }
  }, [reels.length])

  const goNext = useCallback(() => {
    goToReel(currentIndex + 1)
  }, [currentIndex, goToReel])

  const goPrev = useCallback(() => {
    goToReel(currentIndex - 1)
  }, [currentIndex, goToReel])

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    
    const touchEnd = e.changedTouches[0].clientY
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext()
      } else {
        goPrev()
      }
    }

    setTouchStart(null)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowUp') goPrev()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }
      if (e.key === 'm') setIsMuted(!isMuted)
      if (e.key === 'Escape') router.push('/')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, isPlaying, isMuted])

  // Wheel navigation
  useEffect(() => {
    let wheelTimeout = null
    
    const handleWheel = (e) => {
      if (wheelTimeout) return
      
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 0) goNext()
        if (e.deltaY < 0) goPrev()
        wheelTimeout = null
      }, 200)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [goNext, goPrev])

  const handleLike = async (reelId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    try {
      await fetch(`${API_URL}/reels/${reelId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Update local state
      setReels(prev => prev.map(r => 
        r.id === reelId 
          ? { ...r, reel_likes: (r.reel_likes || 0) + 1, isLiked: true }
          : r
      ))
    } catch (error) {
      console.error('Errore like:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Play className="mx-auto text-gray-600 mb-4" size={64} />
          <p className="text-white text-xl mb-2">Nessun reel disponibile</p>
          <Link href="/" className="text-pink-400 hover:underline">
            Torna alla home
          </Link>
        </div>
      </div>
    )
  }

  const currentReel = reels[currentIndex]

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reel Container */}
      <div className="h-full relative">
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className={`absolute inset-0 transition-transform duration-300 ${
              index === currentIndex 
                ? 'translate-y-0 opacity-100' 
                : index < currentIndex 
                  ? '-translate-y-full opacity-0'
                  : 'translate-y-full opacity-0'
            }`}
          >
            {/* Video/Image */}
            <div className="absolute inset-0">
              {reel.media?.[0]?.type === 'video' ? (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={reel.media[0].url}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              ) : reel.media?.[0]?.url ? (
                <img
                  src={reel.media[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center">
                  <Play className="text-white/50" size={80} />
                </div>
              )}
            </div>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

            {/* Play/Pause indicator */}
            {!isPlaying && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="text-white ml-1" size={40} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <button
          onClick={() => router.push('/')}
          className="p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur transition"
        >
          <X size={24} className="text-white" />
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-black/30 backdrop-blur text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {reels.length}
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur transition"
        >
          {isMuted ? (
            <VolumeX size={24} className="text-white" />
          ) : (
            <Volume2 size={24} className="text-white" />
          )}
        </button>
      </div>

      {/* Navigation Hints */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 p-2 text-white/50 hover:text-white transition z-10"
        >
          <ChevronUp size={40} />
        </button>
      )}
      
      {currentIndex < reels.length - 1 && (
        <button
          onClick={goNext}
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 p-2 text-white/50 hover:text-white transition z-10 animate-bounce"
        >
          <ChevronDown size={40} />
        </button>
      )}

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Profile */}
        <Link 
          href={`/profile/${currentReel.id}`}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
            {currentReel.media?.[0]?.url ? (
              <img
                src={currentReel.media[0].url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <User className="text-gray-400" size={24} />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
        </Link>

        {/* Like */}
        <button
          onClick={() => handleLike(currentReel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-2 rounded-full transition ${
            currentReel.isLiked ? 'text-pink-500' : 'text-white'
          }`}>
            <Heart 
              size={30} 
              fill={currentReel.isLiked ? 'currentColor' : 'none'}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {currentReel.reel_likes || 0}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 text-white">
            <MessageCircle size={30} />
          </div>
          <span className="text-white text-xs font-medium">0</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="p-2 text-white">
            <Share2 size={28} />
          </div>
          <span className="text-white text-xs font-medium">Condividi</span>
        </button>

        {/* Contact */}
        <Link
          href={`/profile/${currentReel.id}#contact`}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-3 bg-pink-500 rounded-full text-white">
            <Phone size={24} />
          </div>
          <span className="text-white text-xs font-medium">Contatta</span>
        </Link>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-20 p-4 z-10">
        {/* User Info */}
        <Link
          href={`/profile/${currentReel.id}`}
          className="flex items-center gap-3 mb-3"
        >
          <span className="text-white font-bold text-lg">
            @{currentReel.stage_name || currentReel.title || 'Utente'}
          </span>
          {currentReel.is_verified && (
            <span className="bg-blue-500 rounded-full p-0.5">
              <Check size={12} className="text-white" />
            </span>
          )}
          {currentReel.is_vip && (
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs px-2 py-0.5 rounded font-bold">
              VIP
            </span>
          )}
        </Link>

        {/* Description */}
        {currentReel.description && (
          <p className="text-white text-sm mb-2 line-clamp-2">
            {currentReel.description}
          </p>
        )}

        {/* Location & Stats */}
        <div className="flex items-center gap-4 text-gray-300 text-sm">
          {currentReel.city?.name && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {currentReel.city.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {currentReel.reel_views || 0} views
          </span>
          {currentReel.price_1hour && (
            <span className="text-pink-400 font-bold">
              €{currentReel.price_1hour}/h
            </span>
          )}
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1 z-10">
        {reels.slice(0, 10).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white' 
                : index < currentIndex 
                  ? 'bg-white/50' 
                  : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col justify-end">
          <div className="bg-gray-900 rounded-t-3xl max-h-[70%] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-bold">Commenti</h3>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-gray-500 text-center py-10">
                Nessun commento ancora
              </p>
            </div>
            <div className="p-4 border-t border-gray-800">
              <input
                type="text"
                placeholder="Aggiungi un commento..."
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
