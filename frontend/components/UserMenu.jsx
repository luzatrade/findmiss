'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  X, User, Heart, Bell, Settings, HelpCircle, LogOut, LogIn, UserPlus, 
  Briefcase, MessageCircle, CreditCard, Shield, Play
} from 'lucide-react'

export default function UserMenu({ isOpen, onClose }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          setUser(JSON.parse(userStr))
          setIsLoggedIn(true)
        } catch {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }
  }, [isOpen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
    onClose()
    router.push('/')
  }

  const handleNavigation = (path) => {
    onClose()
    router.push(path)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Menu</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {!isLoggedIn ? (
            <>
              {/* Non loggato */}
              <button 
                onClick={() => handleNavigation('/auth')}
                className="w-full bg-pink-500 hover:bg-pink-600 p-4 rounded-xl flex items-center gap-4 transition text-white"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <LogIn size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Accedi</div>
                  <div className="text-sm text-pink-100">Accedi al tuo account</div>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/auth')}
                className="w-full bg-gray-100 hover:bg-gray-200 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserPlus size={24} className="text-gray-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg text-gray-900">Registrati</div>
                  <div className="text-sm text-gray-500">Crea un nuovo account</div>
                </div>
              </button>

              <div className="h-px bg-gray-100 my-4" />

              <button 
                onClick={() => handleNavigation('/auth')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 p-4 rounded-xl flex items-center gap-4 transition text-white"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Pubblica Annuncio</div>
                  <div className="text-sm text-pink-100">Diventa inserzionista</div>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Loggato - Header profilo */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-xl mb-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xl truncate">
                      {user?.nickname || user?.email?.split('@')[0] || 'Utente'}
                    </div>
                    <div className="text-sm text-pink-100 truncate">{user?.email}</div>
                    <div className="text-xs text-pink-200 mt-1 capitalize">
                      {user?.role === 'advertiser' ? '👑 Inserzionista' : '👤 Utente'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items loggato */}
              <button 
                onClick={() => handleNavigation(`/profile/${user?.id}`)}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <User size={24} className="text-pink-500" />
                <span className="text-gray-900 font-medium">Il mio profilo</span>
              </button>

              <button 
                onClick={() => handleNavigation('/my-announcements')}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <Briefcase size={24} className="text-amber-500" />
                <span className="text-gray-900 font-medium">I miei annunci</span>
              </button>

              <button 
                onClick={() => handleNavigation('/saved')}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <Heart size={24} className="text-red-500" />
                <span className="text-gray-900 font-medium">Preferiti</span>
              </button>

              <button 
                onClick={() => handleNavigation('/chat')}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <MessageCircle size={24} className="text-blue-500" />
                <span className="text-gray-900 font-medium">Messaggi</span>
              </button>

              <button 
                onClick={() => handleNavigation('/reels')}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <Play size={24} className="text-purple-500" />
                <span className="text-gray-900 font-medium">Reels</span>
              </button>

              <button 
                onClick={() => handleNavigation('/payments')}
                className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <CreditCard size={24} className="text-green-500" />
                <span className="text-gray-900 font-medium">Pagamenti</span>
              </button>

              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
                >
                  <Shield size={24} className="text-indigo-500" />
                  <span className="text-gray-900 font-medium">Admin Panel</span>
                </button>
              )}
            </>
          )}

          <div className="h-px bg-gray-100 my-4" />

          {/* Sempre visibili */}
          <button 
            onClick={() => handleNavigation('/settings')}
            className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
          >
            <Settings size={24} className="text-gray-500" />
            <span className="text-gray-900 font-medium">Impostazioni</span>
          </button>

          <button 
            onClick={() => handleNavigation('/policy')}
            className="w-full bg-gray-50 hover:bg-gray-100 p-4 rounded-xl flex items-center gap-4 transition"
          >
            <HelpCircle size={24} className="text-gray-500" />
            <span className="text-gray-900 font-medium">Aiuto e Privacy</span>
          </button>

          {isLoggedIn && (
            <>
              <div className="h-px bg-gray-100 my-4" />
              <button 
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 p-4 rounded-xl flex items-center gap-4 transition"
              >
                <LogOut size={24} className="text-red-500" />
                <span className="text-red-600 font-medium">Esci</span>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-gray-400 text-sm border-t border-gray-100">
          <p className="font-medium">Find Miss</p>
          <p className="text-xs mt-1">© 2025 Tutti i diritti riservati</p>
        </div>
      </div>
    </div>
  )
}
