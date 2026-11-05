'use client'

import { useCallback, useEffect, useState } from 'react'
import { getApiUrl } from './runtime-api'

const API_URL = getApiUrl()

async function fetchUnreadCounts(token) {
  const headers = { Authorization: `Bearer ${token}` }
  const [notificationsRes, messagesRes] = await Promise.all([
    fetch(`${API_URL}/notifications/unread-count`, { headers, cache: 'no-store' }),
    fetch(`${API_URL}/chat/unread-count`, { headers, cache: 'no-store' }),
  ])

  let notifications = 0
  let messages = 0

  if (notificationsRes.ok) {
    const data = await notificationsRes.json()
    if (data.success) notifications = data.data?.count ?? 0
  }
  if (messagesRes.ok) {
    const data = await messagesRes.json()
    if (data.success) messages = data.data?.count ?? 0
  }

  return { notifications, messages }
}

export function useInboxAlerts(options = {}) {
  const { pollMs = 30000, active = true } = options
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    if (!token) {
      setUnreadNotifications(0)
      setUnreadMessages(0)
      return
    }
    try {
      const counts = await fetchUnreadCounts(token)
      setUnreadNotifications(counts.notifications)
      setUnreadMessages(counts.messages)
    } catch (error) {
      console.error('Errore conteggio avvisi menu:', error)
    }
  }, [])

  useEffect(() => {
    if (!active) return undefined
    refresh()
    if (!pollMs) return undefined
    const interval = setInterval(refresh, pollMs)
    return () => clearInterval(interval)
  }, [active, pollMs, refresh])

  useEffect(() => {
    if (!active || typeof window === 'undefined') return undefined
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [active, refresh])

  const totalUnread = unreadNotifications + unreadMessages

  return {
    isLoggedIn,
    unreadNotifications,
    unreadMessages,
    totalUnread,
    hasAlerts: totalUnread > 0,
    refresh,
  }
}
