'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Bell, Lock, Eye, Shield, Globe, Moon, Sun,
  Smartphone, Mail, Trash2, LogOut, ChevronRight, Check,
  Loader2, AlertCircle, User, Camera
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      likes: true,
      views: false,
      marketing: false,
    },
    privacy: {
      showOnline: true,
      showLastSeen: true,
      profilePublic: true,
    },
    display: {
      darkMode: false,
      language: 'it',
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth?redirect=/settings')
      return
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // ignore
      }
    }
    
    // Carica impostazioni salvate
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch {
        // ignore
      }
    }
    
    setLoading(false)
  }, [])

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    }
    setSettings(newSettings)
    localStorage.setItem('settings', JSON.stringify(newSettings))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    setSaving(true)
    // Simula eliminazione
    await new Promise(resolve => setTimeout(resolve, 1500))
    localStorage.clear()
    router.push('/')
  }

  const SettingToggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-pink-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Impostazioni</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        {user && (
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Profilo</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.nickname?.[0]?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-pink-500 text-white rounded-full shadow-lg">
                  <Camera size={14} />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{user.nickname || 'Utente'}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center gap-1 text-sm text-pink-500 font-medium mt-1"
                >
                  Modifica profilo
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-pink-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Notifiche</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <SettingToggle
              label="Messaggi"
              description="Ricevi notifiche per nuovi messaggi"
              enabled={settings.notifications.messages}
              onChange={(v) => updateSetting('notifications', 'messages', v)}
            />
            <SettingToggle
              label="Like"
              description="Quando qualcuno mette mi piace"
              enabled={settings.notifications.likes}
              onChange={(v) => updateSetting('notifications', 'likes', v)}
            />
            <SettingToggle
              label="Visualizzazioni"
              description="Quando qualcuno visita il tuo profilo"
              enabled={settings.notifications.views}
              onChange={(v) => updateSetting('notifications', 'views', v)}
            />
            <SettingToggle
              label="Promozioni"
              description="Offerte e novità"
              enabled={settings.notifications.marketing}
              onChange={(v) => updateSetting('notifications', 'marketing', v)}
            />
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-pink-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Privacy</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <SettingToggle
              label="Mostra stato online"
              description="Gli altri possono vedere quando sei online"
              enabled={settings.privacy.showOnline}
              onChange={(v) => updateSetting('privacy', 'showOnline', v)}
            />
            <SettingToggle
              label="Ultimo accesso"
              description="Mostra quando sei stato online l'ultima volta"
              enabled={settings.privacy.showLastSeen}
              onChange={(v) => updateSetting('privacy', 'showLastSeen', v)}
            />
            <SettingToggle
              label="Profilo pubblico"
              description="Il tuo profilo è visibile a tutti"
              enabled={settings.privacy.profilePublic}
              onChange={(v) => updateSetting('privacy', 'profilePublic', v)}
            />
          </div>
        </section>

        {/* Account Security */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-pink-500" />
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sicurezza</h2>
            </div>
          </div>
          
          <Link
            href="/settings/password"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-gray-400" />
              <span className="font-medium text-gray-900">Cambia password</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
          
          <Link
            href="/settings/email"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400" />
              <span className="font-medium text-gray-900">Cambia email</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
          
          <Link
            href="/settings/sessions"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Smartphone size={20} className="text-gray-400" />
              <span className="font-medium text-gray-900">Sessioni attive</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </section>

        {/* Display */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={18} className="text-pink-500" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Aspetto</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <SettingToggle
              label="Modalità scura"
              description="Attiva il tema scuro"
              enabled={settings.display.darkMode}
              onChange={(v) => updateSetting('display', 'darkMode', v)}
            />
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Lingua</p>
                <p className="text-sm text-gray-500">Scegli la lingua dell'app</p>
              </div>
              <select
                value={settings.display.language}
                onChange={(e) => updateSetting('display', 'language', e.target.value)}
                className="bg-gray-100 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500"
              >
                <option value="it">🇮🇹 Italiano</option>
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={18} className="text-red-500" />
            <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide">Zona pericolosa</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              <LogOut size={18} />
              Esci dall'account
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition"
            >
              <Trash2 size={18} />
              Elimina account
            </button>
          </div>
        </section>

        {/* App Info */}
        <div className="text-center text-gray-400 text-sm py-4">
          <p>FindMiss v1.0</p>
          <p className="text-xs mt-1">© 2024 Tutti i diritti riservati</p>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Elimina account?</h3>
              <p className="text-gray-500 mb-6">
                Questa azione è irreversibile. Tutti i tuoi dati, annunci e messaggi verranno eliminati permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                  disabled={saving}
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Elimina
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

