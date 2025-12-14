import React, { useState, useEffect } from 'react'
import { X, Shield } from 'react-feather'
import ProtectedMediaViewer from '../ProtectedMediaViewer'
import { getConversationMessages, sendMessage as apiSendMessage } from '../../lib/api' // es. import delle funzioni API

export default function Chat({ conversationId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)

  // Recupera utente corrente da localStorage (assicurarsi che il login salvi user { id, ... })
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null

  useEffect(() => {
    let mounted = true

    async function loadMessages() {
      try {
        setLoading(true)
        const res = await getConversationMessages(conversationId)
        if (!mounted) return
        setMessages(res.data || [])
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Errore caricamento messaggi:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMessages()

    return () => {
      mounted = false
    }
  }, [conversationId])

  function openProtectedMedia(id) {
    setSelectedMedia(id)
  }

  async function handleSendText(text) {
    try {
      const res = await apiSendMessage(conversationId, { type: 'text', text })
      // aggiorna UI localmente (ottimistica)
      setMessages(prev => [...prev, res.data])
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Errore invio messaggio:', err)
    }
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
            className={`flex ${msg.sender_id === (currentUser ? currentUser.id : null) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.sender_id === (currentUser ? currentUser.id : null)
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
                    onClick={() => openProtectedMedia(msg.protected_media[0].id)}
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
                {/* timestamp o altre info */}
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizzatore media protetti */}
      {selectedMedia && (
        <ProtectedMediaViewer
          mediaId={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      {/* Input / Invio messaggi (semplificato) */}
      <div className="p-4 border-t border-gray-800">
        <MessageInput onSend={handleSendText} />
      </div>
    </div>
  )
}
