'use client'
import { useEffect, useState } from 'react'
import { SocketProvider } from './SocketProvider'

export default function ClientProviders({ children }) {
  const [token, setToken] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)

    // Ascolta cambiamenti del token
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Non renderizzare nulla finché non siamo sul client
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SocketProvider token={token}>
      {children}
    </SocketProvider>
  )
}

