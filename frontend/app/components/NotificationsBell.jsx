'use client'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Effetto per il mount - evita hydration mismatch
  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (token) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setUnreadCount(data.data.count)
        }
      }
    } catch (error) {
      console.error('Errore fetch notifiche:', error)
    }
  }

  const fetchNotifications = async () => {
    if (loading) return
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_URL}/notifications?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setNotifications(data.data)
        }
      }
    } catch (error) {
      console.error('Errore fetch notifiche:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Errore marcatura notifica:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Errore marcatura tutte notifiche:', error)
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications()
    }
    setIsOpen(!isOpen)
  }

  // Non renderizzare nulla finché non siamo sul client
  if (!mounted) return null
  
  // Non mostrare se non loggato
  if (!isLoggedIn) return null

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-pink-500 transition"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifiche</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-pink-500 hover:text-pink-600"
                >
                  Segna tutte come lette
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Caricamento...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Nessuna notifica
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                        !notification.is_read ? 'bg-pink-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-1 ${!notification.is_read ? 'font-medium' : ''}`}>
                          <div className="text-sm text-gray-900">{notification.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
