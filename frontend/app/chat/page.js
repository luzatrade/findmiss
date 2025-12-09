'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Image, MoreVertical, Phone, Video, Check, CheckCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSocket } from '../components/SocketProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ChatPage() {
  const router = useRouter()
  const { socket, connected } = useSocket()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Controlla autenticazione
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    loadConversations()
  }, [])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (message) => {
      if (selectedConversation && message.conversation_id === selectedConversation.id) {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      }
      // Aggiorna preview conversazione
      setConversations(prev => prev.map(c => 
        c.id === message.conversation_id 
          ? { ...c, last_message: message, updated_at: new Date().toISOString() }
          : c
      ))
    })

    return () => {
      socket.off('new_message')
    }
  }, [socket, selectedConversation])

  // Scroll automatico ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setConversations(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento conversazioni:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento messaggi:', error)
    }
  }

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation)
    await loadMessages(conversation.id)
    
    // Unisciti alla room WebSocket
    if (socket) {
      socket.emit('join_conversation', conversation.id)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, message_type: 'text' })
      })

      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.data])
        // Aggiorna preview
        setConversations(prev => prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, last_message: data.data, updated_at: new Date().toISOString() }
            : c
        ))
      }
    } catch (error) {
      console.error('Errore invio messaggio:', error)
      setNewMessage(content) // Ripristina in caso di errore
    } finally {
      setIsSending(false)
    }
  }

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.id
    } catch {
      return null
    }
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ieri'
    }
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-500">Caricamento chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {selectedConversation ? (
            <>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-pink-500 font-semibold">
                    {selectedConversation.other_user?.nickname?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {selectedConversation.other_user?.nickname || 'Utente'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {connected ? '🟢 Online' : '⚪ Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Video size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Messaggi</h1>
              <div className="w-10" />
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar conversazioni (desktop always, mobile quando nessuna selezionata) */}
        <aside className={`w-full lg:w-80 lg:border-r border-gray-200 bg-white overflow-y-auto ${
          selectedConversation ? 'hidden lg:block' : 'block'
        }`}>
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nessuna conversazione</h3>
              <p className="text-gray-500 text-sm">
                Contatta un inserzionista per iniziare una chat
              </p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition"
              >
                Sfoglia annunci
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition text-left ${
                    selectedConversation?.id === conv.id ? 'bg-pink-50' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-pink-500 font-semibold text-lg">
                      {conv.other_user?.nickname?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.other_user?.nickname || 'Utente'}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(conv.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.content || 'Nessun messaggio'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Area messaggi */}
        <main className={`flex-1 flex flex-col ${
          selectedConversation ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Messaggi */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => {
                  const isMine = msg.sender_id === getCurrentUserId()
                  const showDate = idx === 0 || 
                    new Date(messages[idx - 1].created_at).toDateString() !== 
                    new Date(msg.created_at).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMine 
                            ? 'bg-pink-500 text-white rounded-br-md' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}>
                          <p className="break-words">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isMine ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            <span className="text-xs">{formatTime(msg.created_at)}</span>
                            {isMine && (
                              msg.is_read 
                                ? <CheckCheck size={14} />
                                : <Check size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input messaggio */}
              <form 
                onSubmit={sendMessage}
                className="sticky bottom-0 bg-white border-t border-gray-200 p-4"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                  >
                    <Image size={22} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/60"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 hidden lg:flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Seleziona una conversazione
                </h3>
                <p className="text-gray-500">
                  Scegli una chat dalla lista per iniziare
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

