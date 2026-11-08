'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Pause, Play, Volume2, VolumeX, Trash2,
} from 'lucide-react'

import { getApiUrl, toAbsoluteMediaUrl } from '../../lib/runtime-api'
import { buildAuthHref } from '../../lib/authRedirect'

const API_URL = getApiUrl()

const normalizeStories = (groups = []) => {
  return groups
    .map((group) => {
      const normalizedStories = (group.stories || [])
        .map((story) => ({
          ...story,
          id: String(story.id),
          type: story.type || 'image',
          url: toAbsoluteMediaUrl(story.url || story.media_url || story.thumbnail_url || ''),
          created_at: story.created_at || new Date().toISOString(),
          duration: Number(story.duration || (story.type === 'video' ? 15 : 5)),
          announcement_id: story.announcement_id || story.announcement?.id || null,
          expires_at: story.expires_at || null,
        }))
        .filter((story) => Boolean(story.url))

      const normalizedUserId = String(group.user_id || group.user?.id || '')

      return {
        user_id: normalizedUserId,
        user: {
          ...(group.user || {}),
          id: String(group.user?.id || normalizedUserId || ''),
        },
        stories: normalizedStories,
      }
    })
    .filter((group) => group.stories.length > 0)
}

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
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [viewerUserId, setViewerUserId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const progressInterval = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      setViewerUserId(u.id || null)
    } catch {
      setViewerUserId(null)
    }
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
        const normalized = normalizeStories(data.data)
        setStories(normalized)

        if (startUserId) {
          const idx = normalized.findIndex(
            (s) =>
              String(s.user_id) === String(startUserId) ||
              String(s.user?.id) === String(startUserId)
          )
          if (idx >= 0) setCurrentUserIndex(idx)
        }
      } else {
        setStories([])
      }
    } catch (error) {
      console.error('Errore caricamento stories:', error)
      setStories([])
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
  }, [currentUserIndex, currentStoryIndex, isPaused, loading, stories])

  useEffect(() => {
    if (loading || stories.length === 0) return

    const story = stories[currentUserIndex]?.stories?.[currentStoryIndex]
    if (!story?.id) return

    const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`
    localStorage.setItem('session_id', sessionId)

    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    fetch(`${API_URL}/stories/${story.id}/view`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => {
      // best effort
    })
  }, [currentUserIndex, currentStoryIndex, stories, loading])

  const startProgress = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    setProgress(0)

    const activeStory = stories[currentUserIndex]?.stories?.[currentStoryIndex]
    const durationMs = Math.max(1, Number(activeStory?.duration || (activeStory?.type === 'video' ? 15 : 5))) * 1000
    const interval = 50
    const increment = (interval / durationMs) * 100

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
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
      setCurrentStoryIndex((prev) => prev + 1)
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
    } else {
      router.back()
    }
  }

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1)
      const prevUser = stories[currentUserIndex - 1]
      setCurrentStoryIndex((prevUser?.stories?.length || 1) - 1)
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

  const deleteCurrentStory = async () => {
    const activeStory = stories[currentUserIndex]?.stories?.[currentStoryIndex]
    if (!activeStory?.id || isDeleting) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push(buildAuthHref({ redirect: '/stories' }))
      return
    }

    if (!window.confirm('Eliminare questa storia? Sparirà subito dal feed.')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/stories/${activeStory.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eliminazione non riuscita')
      }

      setStories((prev) => {
        const next = prev
          .map((group, gIdx) => {
            if (gIdx !== currentUserIndex) return group
            const filtered = group.stories.filter((_, sIdx) => sIdx !== currentStoryIndex)
            return { ...group, stories: filtered }
          })
          .filter((group) => group.stories.length > 0)

        if (next.length === 0) {
          router.push('/')
          return next
        }

        if (currentStoryIndex >= (next[currentUserIndex]?.stories?.length || 0)) {
          setCurrentStoryIndex(Math.max(0, (next[currentUserIndex]?.stories?.length || 1) - 1))
        }
        if (currentUserIndex >= next.length) {
          setCurrentUserIndex(Math.max(0, next.length - 1))
        }
        return next
      })
    } catch (error) {
      alert(error.message || 'Errore eliminazione storia')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatExpiresLabel = (expiresAt) => {
    if (!expiresAt) return '24h dal post'
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Scaduta'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `Scade tra ${hours}h ${mins}m`
    return `Scade tra ${mins} min`
  }

  const sendReply = async () => {
    if (!replyText.trim() || isSendingReply) return

    const activeStory = stories[currentUserIndex]?.stories?.[currentStoryIndex]
    if (!activeStory) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push(buildAuthHref({ redirect: '/stories' }))
      return
    }

    if (!activeStory.announcement_id) {
      setReplyError('Questa storia non supporta risposte dirette in chat.')
      return
    }

    setIsSendingReply(true)
    setReplyError('')

    try {
      const contactRes = await fetch(`${API_URL}/announcements/${activeStory.announcement_id}/contact`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const contactData = await contactRes.json()
      if (!contactData.success || !contactData.data?.conversation_id) {
        throw new Error(contactData.error || 'Impossibile aprire la chat')
      }

      const messageRes = await fetch(`${API_URL}/chat/conversations/${contactData.data.conversation_id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText.trim(),
          message_type: 'text',
        }),
      })

      const messageData = await messageRes.json()
      if (!messageData.success) {
        throw new Error(messageData.error || 'Invio risposta fallito')
      }

      setReplyText('')
      setShowReply(false)
    } catch (error) {
      setReplyError(error.message || 'Errore durante l\'invio della risposta')
    } finally {
      setIsSendingReply(false)
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <div className="text-center max-w-sm">
          <p className="text-xl mb-2">Nessuna storia attiva</p>
          <p className="text-white/60 text-sm mb-6">
            Le storie degli inserzionisti durano 24 ore. Se sei inserzionista, pubblicane una dalla home (bollino &quot;Nuova&quot;).
          </p>
          <button type="button" onClick={() => router.push('/')} className="text-pink-400 font-medium">
            Torna alla home
          </button>
        </div>
      </div>
    )
  }

  const currentUser = stories[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]
  const isOwnStory =
    viewerUserId &&
    String(currentUser?.user_id || currentUser?.user?.id) === String(viewerUserId)

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
              {formatExpiresLabel(currentStory?.expires_at)} ·{' '}
              {new Date(currentStory?.created_at).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwnStory && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                deleteCurrentStory()
              }}
              disabled={isDeleting}
              className="p-2 text-white hover:bg-white/10 rounded-full"
              title="Elimina questa storia"
            >
              <Trash2 size={22} />
            </button>
          )}
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
          <div>
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
                disabled={isSendingReply}
                className="p-3 bg-pink-500 rounded-full text-white disabled:opacity-60"
              >
                <Send size={20} />
              </button>
              <button
                onClick={() => {
                  setShowReply(false)
                  setReplyError('')
                }}
                className="p-3 text-white"
              >
                <X size={20} />
              </button>
            </div>
            {replyError ? <p className="text-red-300 text-xs mt-2">{replyError}</p> : null}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setShowReply(true)
                setReplyError('')
              }}
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
