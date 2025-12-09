'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Shield, Clock } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ProtectedMediaViewer({ mediaId, onClose, token }) {
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [viewed, setViewed] = useState(false)
  const imgRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!mediaId || !token) {
      setError('Accesso negato')
      setLoading(false)
      return
    }

    fetch(`${API_URL}/chat/protected-media/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMedia(data.data)
          setViewed(true)
          
          // Timer per scadenza
          if (data.data.expires_at) {
            const expiresAt = new Date(data.data.expires_at)
            const interval = setInterval(() => {
              const now = new Date()
              const diff = expiresAt - now
              if (diff <= 0) {
                setTimeRemaining(0)
                clearInterval(interval)
                onClose()
              } else {
                setTimeRemaining(Math.floor(diff / 1000))
              }
            }, 1000)
            return () => clearInterval(interval)
          }
        } else {
          setError(data.error || 'Errore caricamento media')
        }
      })
      .catch(err => {
        setError('Errore caricamento media')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [mediaId, token, onClose])

  // Blocco screenshot (best effort)
  useEffect(() => {
    if (!media?.screenshot_block) return

    const preventScreenshot = (e) => {
      // Disabilita tasto destro
      if (e.button === 2) {
        e.preventDefault()
        return false
      }
    }

    const preventCopy = (e) => {
      // Disabilita copia
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        return false
      }
    }

    const preventDevTools = (e) => {
      // Tenta di bloccare DevTools (limitato)
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('contextmenu', preventScreenshot)
    document.addEventListener('keydown', preventCopy)
    document.addEventListener('keydown', preventDevTools)

    // Blocca download immagini
    if (imgRef.current) {
      imgRef.current.addEventListener('dragstart', (e) => e.preventDefault())
    }
    if (videoRef.current) {
      videoRef.current.addEventListener('contextmenu', (e) => e.preventDefault())
      videoRef.current.setAttribute('controlsList', 'nodownload')
    }

    return () => {
      document.removeEventListener('contextmenu', preventScreenshot)
      document.removeEventListener('keydown', preventCopy)
      document.removeEventListener('keydown', preventDevTools)
    }
  }, [media])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center">
          <Shield className="mx-auto mb-4" size={48} />
          <p className="text-lg">Caricamento media protetto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-center p-6">
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            Chiudi
          </button>
        </div>
      </div>
    )
  }

  if (!media) return null

  const formatTime = (seconds) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Overlay protezione */}
      {media.is_protected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur px-4 py-2 rounded-full">
            <Shield size={16} className="text-purple-400" />
            <span className="text-white text-sm font-semibold">Media Protetto</span>
          </div>
          
          {timeRemaining !== null && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur px-4 py-2 rounded-full">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-white text-sm font-semibold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          {media.view_once && viewed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur px-4 py-2 rounded-full">
              <span className="text-white text-sm font-semibold">
                Visualizzazione unica - Questo media verrà eliminato
              </span>
            </div>
          )}
        </div>
      )}

      {/* Media */}
      <div className="relative max-w-full max-h-full">
        {media.type === 'image' ? (
          <img
            ref={imgRef}
            src={media.media_url}
            alt="Media protetto"
            className="max-w-full max-h-[90vh] object-contain"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <video
            ref={videoRef}
            src={media.media_url}
            controls
            className="max-w-full max-h-[90vh]"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
      </div>

      {/* Pulsante chiusura */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black/90 transition z-10"
      >
        <X size={24} />
      </button>

      {/* Avviso screenshot */}
      {media.screenshot_block && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur px-4 py-2 rounded-lg">
          <p className="text-black text-sm font-semibold">
            ⚠️ Screenshot e download disabilitati
          </p>
        </div>
      )}
    </div>
  )
}





