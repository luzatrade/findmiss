'use client'

import Link from 'next/link'
import { Bell, MessageCircle } from 'lucide-react'

export default function MenuAlertsBanner({
  unreadNotifications = 0,
  unreadMessages = 0,
  onNavigate,
}) {
  const total = unreadNotifications + unreadMessages
  if (total <= 0) return null

  const parts = []
  if (unreadMessages > 0) {
    parts.push(
      unreadMessages === 1 ? '1 messaggio in chat' : `${unreadMessages} messaggi in chat`
    )
  }
  if (unreadNotifications > 0) {
    parts.push(
      unreadNotifications === 1 ? '1 notifica' : `${unreadNotifications} notifiche`
    )
  }

  return (
    <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-900">
        Hai {parts.join(' e ')} non {total === 1 ? 'letto' : 'letti'}
      </p>
      <div className="flex flex-wrap gap-2">
        {unreadMessages > 0 && (
          <Link
            href="/chat"
            onClick={() => onNavigate?.()}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
          >
            <MessageCircle size={14} />
            Apri chat
          </Link>
        )}
        {unreadNotifications > 0 && (
          <Link
            href="/settings"
            onClick={() => onNavigate?.()}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-pink-200 px-3 py-1.5 text-xs font-medium text-pink-700 hover:bg-pink-50"
          >
            <Bell size={14} />
            Vedi notifiche
          </Link>
        )}
      </div>
    </div>
  )
}
