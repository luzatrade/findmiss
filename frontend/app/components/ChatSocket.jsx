'use client'
import { useEffect, useState } from 'react'
import { useSocket } from './SocketProvider'

export function useChatSocket(conversationId) {
  const { socket, connected } = useSocket()
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (!socket || !conversationId) return

    // Join conversazione
    socket.emit('conversation:join', { conversation_id: conversationId })

    // Ascolta nuovi messaggi
    const handleNewMessage = (message) => {
      setMessages(prev => {
        // Evita duplicati
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, message]
      })
    }

    // Ascolta typing
    const handleTypingStart = ({ userId, nickname }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev
        return [...prev, { userId, nickname }]
      })
    }

    const handleTypingStop = ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    }

    // Ascolta messaggio letto
    const handleMessageRead = ({ message_id, read_by }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message_id ? { ...msg, is_read: true, read_at: new Date() } : msg
        )
      )
    }

    socket.on('message:new', handleNewMessage)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('message:read', handleMessageRead)

    return () => {
      socket.emit('conversation:leave', { conversation_id: conversationId })
      socket.off('message:new', handleNewMessage)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('message:read', handleMessageRead)
    }
  }, [socket, conversationId])

  const sendMessage = (content, messageType = 'text', protectedMedia = null) => {
    if (!socket || !conversationId) return

    socket.emit('message:send', {
      conversation_id: conversationId,
      content,
      message_type: messageType,
      protected_media: protectedMedia
    })
  }

  const markAsRead = (messageId) => {
    if (!socket || !conversationId) return

    socket.emit('message:read', {
      message_id: messageId,
      conversation_id: conversationId
    })
  }

  const startTyping = () => {
    if (!socket || !conversationId) return
    socket.emit('typing:start', { conversation_id: conversationId })
  }

  const stopTyping = () => {
    if (!socket || !conversationId) return
    socket.emit('typing:stop', { conversation_id: conversationId })
  }

  return {
    messages,
    typingUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    connected
  }
}

