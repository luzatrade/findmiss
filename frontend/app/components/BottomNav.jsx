'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, User, Film, MessageCircle } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdvertiser, setIsAdvertiser] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      setIsLoggedIn(!!token)
      if (user) {
        try {
          const parsed = JSON.parse(user)
          setIsAdvertiser(parsed.role === 'advertiser')
        } catch {}
      }
    }
  }, [pathname])

  // Nascondi su alcune pagine
  const hiddenPaths = ['/auth', '/stories', '/reels', '/announcements/new']
  const shouldHide = hiddenPaths.some(p => pathname.startsWith(p))
  
  if (shouldHide) return null

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/filtri', icon: Search, label: 'Cerca' },
    { href: '/reels', icon: Film, label: 'Reels' },
    { href: '/saved', icon: Heart, label: 'Preferiti' },
  ]

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg safe-area-inset-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                active ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
        
        {/* Menu/Profile */}
        <Link
          href="/menu"
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
            pathname === '/menu' ? 'text-pink-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={22} strokeWidth={pathname === '/menu' ? 2.5 : 2} />
          <span className={`text-[10px] mt-0.5 ${pathname === '/menu' ? 'font-semibold' : ''}`}>
            Menu
          </span>
        </Link>
      </div>
    </nav>
  )
}
