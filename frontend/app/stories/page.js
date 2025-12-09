'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function StoriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startUserId = searchParams.get('user')
  
  const [stories, setStories] = useState([])
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [showReply, setShowReply] = useState(false)
  
  const progressInterval = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    loadStories()
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [])

  const loadStories = async () => {
    try {
      const res = await fetch(`${API_URL}/stories`)
      const data = await res.json()
      
      if (data.success && data.data?.length > 0) {
        setStories(data.data)
        
        if (startUserId) {
          const idx = data.data.findIndex(s => s.user_id === parseInt(startUserId))
          if (idx >= 0) setCurrentUserIndex(idx)
        }
      } else {
        // Demo stories
        setStories([
          {
            user_id: 1,
            user: { nickname: 'Sofia', avatar: null },
            stories: [
              { id: 1, type: 'image', url: 'https://picsum.photos/400/700?random=s1', created_at: new Date().toISOString() },
              { id: 2, type: 'image', url: 'https://picsum.photos/400/700?random=s2', created_at: new Date().toISOString() },
            ]
          },
          {
            user_id: 2,
            user: { nickname: 'Valentina', avatar: null },
            stories: [
              { id: 3, type: 'image', url: 'https://picsum.photos/400/700?random=s3', created_at: new Date().toISOString() },
            ]
          },
          {
            user_id: 3,
            user: { nickname: 'Giulia', avatar: null },
            stories: [
              { id: 4, type: 'image', url: 'https://picsum.photos/400/700?random=s4', created_at: new Date().toISOString() },
              { id: 5, type: 'image', url: 'https://picsum.photos/400/700?random=s5', created_at: new Date().toISOString() },
              { id: 6, type: 'image', url: 'https://picsum.photos/400/700?random=s6', created_at: new Date().toISOString() },
            ]
          },
        ])
      }
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loading || stories.length === 0 || isPaused) return
    
    startProgress()
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [currentUserIndex, currentStoryIndex, isPaused, loading])

  const startProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    setProgress(0)
    
    const duration = 5000 // 5 secondi per storia
    const interval = 50
    const increment = (interval / duration) * 100
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory()
          return 0
        }
        return prev + increment
      })
    }, interval)
  }

  const nextStory = () => {
    const currentUser = stories[currentUserIndex]
    if (!currentUser) return
    
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(prev => prev + 1)
      setCurrentStoryIndex(0)
    } else {
      router.back()
    }
  }

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1)
      const prevUser = stories[currentUserIndex - 1]
      setCurrentStoryIndex(prevUser.stories.length - 1)
    }
  }

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    if (x < width / 3) {
      prevStory()
    } else if (x > (width * 2) / 3) {
      nextStory()
    } else {
      setIsPaused(!isPaused)
    }
  }

  const sendReply = () => {
    if (!replyText.trim()) return
    // TODO: Implementare invio risposta
    setReplyText('')
    setShowReply(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Nessuna storia disponibile</p>
          <button onClick={() => router.back()} className="text-pink-500">
            Torna indietro
          </button>
        </div>
      </div>
    )
  }

  const currentUser = stories[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 px-2 pt-2 flex gap-1">
        {currentUser?.stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {currentUser?.user?.nickname?.[0] || '?'}
          </div>
          <div>
            <p className="text-white font-semibold">{currentUser?.user?.nickname || 'Utente'}</p>
            <p className="text-white/60 text-xs">
              {new Date(currentStory?.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 text-white"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-white"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button onClick={() => router.back()} className="p-2 text-white">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div className="absolute inset-0" onClick={handleTap}>
        {currentStory?.type === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.url}
            className="w-full h-full object-contain"
            autoPlay
            muted={isMuted}
            playsInline
          />
        ) : (
          <img
            src={currentStory?.url}
            alt=""
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Navigation arrows (desktop) */}
      <button
        onClick={prevStory}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hidden md:block hover:bg-black/50 transition"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextStory}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white hidden md:block hover:bg-black/50 transition"
      >
        <ChevronRight size={28} />
      </button>

      {/* Footer actions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        {showReply ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Rispondi alla storia..."
              className="flex-1 bg-white/20 backdrop-blur rounded-full px-4 py-3 text-white placeholder-white/60 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && sendReply()}
            />
            <button
              onClick={sendReply}
              className="p-3 bg-pink-500 rounded-full text-white"
            >
              <Send size={20} />
            </button>
            <button
              onClick={() => setShowReply(false)}
              className="p-3 text-white"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowReply(true)}
              className="flex-1 bg-white/20 backdrop-blur rounded-full px-4 py-3 text-white/60 text-left"
            >
              Rispondi...
            </button>
            <div className="flex items-center gap-2 ml-2">
              <button className="p-3 text-white">
                <Heart size={24} />
              </button>
              <button className="p-3 text-white">
                <MessageCircle size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User thumbnails */}
      <div className="absolute bottom-24 left-0 right-0 z-10 px-4">
        <div className="flex justify-center gap-2 overflow-x-auto py-2">
          {stories.map((user, idx) => (
            <button
              key={user.user_id}
              onClick={() => {
                setCurrentUserIndex(idx)
                setCurrentStoryIndex(0)
              }}
              className={`w-12 h-12 rounded-full flex-shrink-0 border-2 overflow-hidden transition ${
                idx === currentUserIndex ? 'border-pink-500 scale-110' : 'border-white/30'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user.user?.nickname?.[0] || '?'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

