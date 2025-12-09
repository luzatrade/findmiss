'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, Image as ImageIcon, Video, Shield, X } from 'lucide-react'
import ProtectedMediaViewer from './ProtectedMediaViewer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function Chat({ conversationId, token, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!conversationId || !token) return

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll ogni 3 secondi

    return () => clearInterval(interval)
  }, [conversationId, token])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setMessages(data.data)
        setLoading(false)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Errore fetch messaggi:', error)
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (content, messageType = 'text', protectedMedia = null) => {
    if (!content && !protectedMedia) return

    setSending(true)
    try {
      const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          message_type: messageType,
          protected_media: protectedMedia
        })
      })

      const data = await response.json()
      if (data.success) {
        setMessages([...messages, data.data])
        setNewMessage('')
        setShowMediaPicker(false)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Errore invio messaggio:', error)
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Qui dovresti caricare il file su S3/storage e ottenere URL
    // Per ora usiamo un placeholder
    const mediaUrl = URL.createObjectURL(file)
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      alert('Formato file non supportato')
      return
    }

    // Mostra opzioni protezione
    const useProtection = confirm('Vuoi proteggere questo media? (No screenshot, view-once)')
    const viewOnce = useProtection && confirm('Visualizzazione unica? (Si elimina dopo la prima visualizzazione)')
    
    const expiresIn = useProtection ? prompt('Scadenza in secondi (lascia vuoto per nessuna):') : null

    const protectedMedia = {
      media_url: mediaUrl, // In produzione usa URL da storage
      thumbnail_url: isImage ? mediaUrl : null,
      type: isImage ? 'image' : 'video',
      is_protected: useProtection,
      view_once: viewOnce,
      expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
      screenshot_block: useProtection
    }

    sendMessage('', isImage ? 'image' : 'video', protectedMedia)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center">
        <p className="text-white">Caricamento chat...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Chat</h2>
        {onClose && (
          <button onClick={onClose} className="text-white hover:text-gray-300">
            <X size={24} />
          </button>
        )}
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === 'current_user_id' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.sender_id === 'current_user_id'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {msg.message_type === 'text' && (
                <p className="text-sm">{msg.content}</p>
              )}

              {msg.message_type === 'image' && msg.protected_media && msg.protected_media.length > 0 && (
                <div>
                  <img
                    src={msg.protected_media[0].thumbnail_url || msg.protected_media[0].media_url}
                    alt="Media"
                    className="max-w-full rounded-lg cursor-pointer"
                    onClick={() => setSelectedMedia(msg.protected_media[0].id)}
                  />
                  {msg.protected_media[0].is_protected && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield size={12} />
                      <span className="text-xs opacity-75">Protetto</span>
                    </div>
                  )}
                </div>
              )}

              {msg.message_type === 'video' && msg.protected_media && msg.protected_media.length > 0 && (
                <div>
                  <video
                    src={msg.protected_media[0].media_url}
                    controls
                    className="max-w-full rounded-lg"
                  />
                  {msg.protected_media[0].is_protected && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield size={12} />
                      <span className="text-xs opacity-75">Protetto</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.created_at).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900 border-t border-gray-800 p-4">
        {showMediaPicker && (
          <div className="mb-4 flex gap-4">
            <button
              onClick={() => {
                fileInputRef.current?.click()
                setShowMediaPicker(false)
              }}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
            >
              <ImageIcon size={20} />
              <span>Foto</span>
            </button>
            <button
              onClick={() => {
                fileInputRef.current?.click()
                setShowMediaPicker(false)
              }}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
            >
              <Video size={20} />
              <span>Video</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className="p-2 text-white hover:bg-gray-800 rounded-lg"
          >
            <ImageIcon size={24} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(newMessage)
              }
            }}
            placeholder="Scrivi un messaggio..."
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-lg text-white"
          >
            <Send size={20} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Viewer media protetto */}
      {selectedMedia && (
        <ProtectedMediaViewer
          mediaId={selectedMedia}
          token={token}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  )
}





