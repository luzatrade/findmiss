'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children, token }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      // Se non c'è token, chiudi socket esistente
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connesso')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnesso')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Errore connessione WebSocket:', error)
      setConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket deve essere usato dentro SocketProvider')
  }
  return context
}

