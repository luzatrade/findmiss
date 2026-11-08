'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Heart, MessageCircle, Share2, Volume2, VolumeX,
  Play, ChevronUp, ChevronDown, X, Phone, User, Check,
  MapPin, Eye, Plus, Upload, Loader2, Trash2, Film
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { getApiUrl, getApiOrigin, toAbsoluteMediaUrl } from '../../lib/runtime-api'
import OptimizedVideo from '../../components/OptimizedVideo'
import OptimizedImage from '../../components/OptimizedImage'
import { validateMediaFile } from '../../lib/media'
import { fetchCities } from '../../lib/fetchCities'
import CityPickerField from '../../components/CityPickerField'
import { buildAuthHref } from '../../lib/authRedirect'
import {
  deleteReelMedia,
  fetchMyAnnouncements,
  uploadReelToAnnouncement,
} from '../../lib/reelMedia'

const API_URL = getApiUrl()

export default function ReelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startIndex = parseInt(searchParams.get('start') || '0', 10)
  const focusAnnouncementId = searchParams.get('announcement') || searchParams.get('profile')
  
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState(null)
  const [showComments, setShowComments] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [myAnnouncements, setMyAnnouncements] = useState([])
  const [isDeletingReel, setIsDeletingReel] = useState(false)
  const [uploadData, setUploadData] = useState({
    video: null,
    title: '',
    description: '',
    city_id: '',
    category_id: '',
    announcement_id: '',
  })
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const containerRef = useRef(null)
  const videoRefs = useRef({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadReels()
    loadCitiesAndCategories()

    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    setIsLoggedIn(Boolean(token && user))
    if (user) {
      try {
        const parsed = JSON.parse(user)
        setCurrentUserId(parsed.id || null)
      } catch {
        setCurrentUserId(null)
      }
    }
    if (searchParams.get('upload') === '1' && token) {
      setShowUploadModal(true)
    }
  }, [])

  useEffect(() => {
    if (!showUploadModal || !isLoggedIn) return
    const token = localStorage.getItem('token')
    if (!token) return
    fetchMyAnnouncements(token)
      .then(setMyAnnouncements)
      .catch(() => setMyAnnouncements([]))
  }, [showUploadModal, isLoggedIn])

  const loadCitiesAndCategories = async () => {
    try {
      const [cityList, categoriesRes] = await Promise.all([
        fetchCities({ limit: 500 }),
        fetch(`${API_URL}/categories`),
      ])
      setCities(cityList)
      const categoriesData = await categoriesRes.json()
      if (categoriesData.success) setCategories(categoriesData.data || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    }
  }

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
      const apiOrigin = getApiOrigin()
      const res = await fetch(`${API_URL}/reels?limit=50`)
      const data = await res.json()
      if (data.success) {
        const normalized = (data.data || []).map((reel) => {
          const video = reel.video || reel.media?.[0] || null
          const media = video
            ? [{
                ...video,
                url: toAbsoluteMediaUrl(video.url, apiOrigin),
                thumbnail_url: video.thumbnail_url
                  ? toAbsoluteMediaUrl(video.thumbnail_url, apiOrigin)
                  : null,
              }]
            : []
          return {
            ...reel,
            media,
            video: media[0] || null,
            media_id: reel.media_id || media[0]?.id || null,
          }
        })
        setReels(normalized)

        if (focusAnnouncementId) {
          const idx = normalized.findIndex((item) => item.id === focusAnnouncementId)
          if (idx >= 0) {
            setCurrentIndex(idx)
          }
        } else if (startIndex > 0 && startIndex < normalized.length) {
          setCurrentIndex(startIndex)
        }
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
      const res = await fetch(`${API_URL}/reels/${reelId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        setReels(prev => prev.map(r =>
          r.id === reelId
            ? { ...r, reel_likes: (r.reel_likes || 0) + 1, isLiked: true }
            : r
        ))
      } else {
        alert('Errore nel like')
      }
    } catch (error) {
      console.error('Errore like:', error)
      alert('Errore di connessione')
    }
  }

  const handleShare = async (reel) => {
    const shareUrl = `${window.location.origin}/reels?start=${currentIndex}`
    const shareText = `Guarda questo reel di ${reel.stage_name || reel.title}!`

    // Prova Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FindMiss Reel',
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Errore share:', error)
        }
      }
    } else {
      // Fallback: copia link
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copiato negli appunti!')
      } catch (error) {
        alert(`Condividi questo link:\n${shareUrl}`)
      }
    }
  }

  const handleFollow = async (reelId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    try {
      const res = await fetch(`${API_URL}/announcements/${reelId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        setReels(prev => prev.map(r =>
          r.id === reelId
            ? { ...r, isFollowing: !r.isFollowing }
            : r
        ))
      }
    } catch (error) {
      console.error('Errore follow:', error)
      alert('Errore nel follow')
    }
  }

  const handleCall = (reel) => {
    // Se c'è un numero di telefono, chiama direttamente
    if (reel.phone) {
      window.location.href = `tel:${reel.phone}`
    } else {
      // Altrimenti vai all'annuncio nella sezione contatti
      router.push(`/profile/${reel.id}`)
    }
  }

  const handleUploadReel = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    if (!uploadData.video) {
      setUploadError('Seleziona un video')
      return
    }
    setIsUploading(true)
    setUploadError('')

    try {
      if (uploadData.announcement_id) {
        await uploadReelToAnnouncement(token, uploadData.announcement_id, uploadData.video)
        setShowUploadModal(false)
        setUploadData({
          video: null,
          title: '',
          description: '',
          city_id: '',
          category_id: '',
          announcement_id: '',
        })
        await loadReels()
        alert('Reel pubblicato! Ora è visibile nel feed Reels.')
        return
      }

      if (!uploadData.title.trim()) {
        setUploadError('Inserisci un titolo')
        return
      }
      if (!uploadData.city_id) {
        setUploadError('Seleziona una città')
        return
      }
      if (!uploadData.category_id) {
        setUploadError('Seleziona una categoria')
        return
      }

      // 1. Crea annuncio
      const announcementRes = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: uploadData.title,
          stage_name: uploadData.title,
          description: uploadData.description || uploadData.title,
          city_id: uploadData.city_id,
          category_id: uploadData.category_id,
          price_1hour: 100, // Default
          age: 25, // Default
          has_video: true
        })
      })

      const announcementData = await announcementRes.json()

      if (announcementData.success && announcementData.data?.id) {
        await uploadReelToAnnouncement(token, announcementData.data.id, uploadData.video)

        setShowUploadModal(false)
        setUploadData({
          video: null,
          title: '',
          description: '',
          city_id: '',
          category_id: '',
          announcement_id: '',
        })

        await loadReels()
        alert('Reel pubblicato! Ora è visibile nel feed Reels.')
      } else {
        setUploadError(announcementData.error || 'Errore nella pubblicazione')
      }
    } catch (error) {
      console.error('Errore upload:', error)
      setUploadError(error.message || 'Errore di rete, riprova')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteReel = async () => {
    const token = localStorage.getItem('token')
    const reel = reels[currentIndex]
    const mediaId = reel?.media_id || reel?.video?.id
    if (!token || !mediaId) return

    if (!window.confirm('Eliminare questo reel? Il video verrà rimosso dal feed.')) {
      return
    }

    setIsDeletingReel(true)
    try {
      await deleteReelMedia(token, mediaId)
      setReels((prev) => {
        const next = prev.filter((r) => r.media_id !== mediaId && r.video?.id !== mediaId)
        setCurrentIndex((idx) => Math.min(idx, Math.max(0, next.length - 1)))
        return next
      })
    } catch (error) {
      alert(error.message || 'Impossibile eliminare il reel')
    } finally {
      setIsDeletingReel(false)
    }
  }

  const openUploadModal = () => {
    if (!isLoggedIn) {
      router.push(buildAuthHref({ redirect: '/reels?upload=1' }))
      return
    }
    setShowUploadModal(true)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentReel = reels[currentIndex]
  const isOwner =
    Boolean(currentUserId && currentReel?.user?.id === currentUserId) ||
    Boolean(currentUserId && currentReel?.user_id === currentUserId)

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reel Container */}
      <div className="h-full relative">
        {reels.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <Film className="text-gray-600 mb-4" size={64} />
            <p className="text-white text-xl mb-2">Nessun reel nel feed</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Carica un video verticale collegato al tuo annuncio per comparire qui.
            </p>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={openUploadModal}
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-pink-500/30"
              >
                <Plus size={20} />
                Carica reel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(buildAuthHref({ redirect: '/reels?upload=1' }))}
                className="text-pink-400 hover:underline"
              >
                Accedi per caricare un reel
              </button>
            )}
            <Link href="/" className="text-gray-500 hover:text-white text-sm mt-6">
              Torna alla home
            </Link>
          </div>
        )}
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
                <OptimizedVideo
                  ref={(el) => { videoRefs.current[index] = el }}
                  media={reel.media[0]}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="metadata"
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              ) : reel.media?.[0]?.url ? (
                <OptimizedImage
                  media={reel.media[0]}
                  alt={reel.stage_name || reel.title || 'Reel'}
                  variant="full"
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

        {reels.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-black/30 backdrop-blur text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>
        )}
        {reels.length === 0 && <div />}

        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              type="button"
              onClick={openUploadModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-pink-500 hover:bg-pink-600 rounded-full backdrop-blur transition shadow-lg shadow-pink-500/50 text-white text-sm font-semibold"
              title="Carica reel"
            >
              <Plus size={20} />
              <span className="hidden xs:inline sm:inline">Reel</span>
            </button>
          )}

          {isOwner && reels.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteReel}
              disabled={isDeletingReel}
              className="p-2 bg-red-500/90 hover:bg-red-600 rounded-full backdrop-blur transition disabled:opacity-50"
              title="Elimina reel"
            >
              {isDeletingReel ? (
                <Loader2 size={22} className="text-white animate-spin" />
              ) : (
                <Trash2 size={22} className="text-white" />
              )}
            </button>
          )}

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

      {/* Right Side Actions - Ottimizzato per mobile */}
      {currentReel && (
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-3 z-10">
        {/* Profile + Follow */}
        <div className="relative">
          <Link href={`/announcements/${currentReel.id}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
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
          </Link>
          <button
            onClick={() => handleFollow(currentReel.id)}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center transition"
          >
            {currentReel.isFollowing ? (
              <Check size={12} className="text-white" />
            ) : (
              <Plus size={12} className="text-white" />
            )}
          </button>
        </div>

        {/* Like */}
        <button
          onClick={() => handleLike(currentReel.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className={`p-1.5 rounded-full transition ${
            currentReel.isLiked ? 'text-pink-500' : 'text-white'
          }`}>
            <Heart
              size={26}
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
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-1.5 text-white">
            <MessageCircle size={26} />
          </div>
          <span className="text-white text-[10px] font-medium">0</span>
        </button>

        {/* Share */}
        <button
          onClick={() => handleShare(currentReel)}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-1.5 text-white">
            <Share2 size={24} />
          </div>
          <span className="text-white text-[10px] font-medium">Share</span>
        </button>

        {/* Contact */}
        <button
          onClick={() => handleCall(currentReel)}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="p-2.5 bg-pink-500 hover:bg-pink-600 rounded-full text-white transition">
            <Phone size={20} />
          </div>
          <span className="text-white text-[10px] font-medium">Call</span>
        </button>
      </div>
      )}

      {/* Bottom Info */}
      {currentReel && (
      <div className="absolute bottom-0 left-0 right-20 p-4 z-10">
        {/* User Info */}
        <Link
          href={`/announcements/${currentReel.id}`}
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
      )}

      {/* Progress indicators */}
      {reels.length > 0 && (
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
      )}

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

      {/* Upload Reel Modal */}
      {showUploadModal && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Carica Reel</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition"
                disabled={isUploading}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {myAnnouncements.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Collega a un tuo annuncio (consigliato)
                  </label>
                  <select
                    value={uploadData.announcement_id}
                    onChange={(e) =>
                      setUploadData((prev) => ({ ...prev, announcement_id: e.target.value }))
                    }
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={isUploading}
                  >
                    <option value="">Crea nuovo profilo reel</option>
                    {myAnnouncements.map((ann) => (
                      <option key={ann.id} value={ann.id}>
                        {ann.stage_name || ann.title} — {ann.city?.name || 'Senza città'} (
                        {ann.status})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Con un annuncio esistente basta il video: titolo e categoria non servono.
                  </p>
                </div>
              )}

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const validationError = validateMediaFile(file)
                      if (validationError) {
                        setUploadError(validationError)
                        return
                      }
                      setUploadData(prev => ({ ...prev, video: file }))
                      setUploadError('')
                    }
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-700 hover:border-pink-500 rounded-xl transition flex flex-col items-center gap-2"
                  disabled={isUploading}
                >
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-400">
                    {uploadData.video ? uploadData.video.name : 'Seleziona video (max 80MB, MP4/MOV)'}
                  </span>
                </button>
              </div>

              {!uploadData.announcement_id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Es. Ciao sono Sofia..."
                      maxLength={100}
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      placeholder="Descrizione breve..."
                      rows={3}
                      maxLength={200}
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Città *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Cerca il nome (es. Napoli, Palermo, Bologna): tutte le città italiane del sito.
                    </p>
                    <div className={isUploading ? 'pointer-events-none opacity-60' : ''}>
                      <CityPickerField
                        value={uploadData.city_id}
                        cities={cities}
                        onChange={(id) =>
                          setUploadData((prev) => ({ ...prev, city_id: id }))
                        }
                        placeholder="Cerca città..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={uploadData.category_id}
                      onChange={(e) =>
                        setUploadData((prev) => ({ ...prev, category_id: e.target.value }))
                      }
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                      disabled={isUploading}
                    >
                      <option value="">Seleziona categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Error */}
              {uploadError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleUploadReel}
                disabled={isUploading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  'Pubblica Reel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
