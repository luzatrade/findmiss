'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Loader2, Save, AlertCircle, User, Mail, Phone, Lock } from 'lucide-react'

import { getApiUrl } from '../../../lib/runtime-api'
import AdvertiserFilterProfileFields from '../../../components/AdvertiserFilterProfileFields'
import { buildFilterProfilePayload } from '../../../lib/announcementFilterProfile'
import { DEFAULT_SERVICE_FLAGS } from '../../../lib/filterFieldOptions'

const API_URL = getApiUrl()

const emptySearchProfileForm = () => ({
  height: '',
  weight: '',
  hair_color: '',
  eye_color: '',
  cup_size: '',
  ethnicity: '',
  nationality: '',
  language: '',
  body_type: '',
  smoker: false,
  speaks_english: false,
  has_tattoos: false,
  has_piercings: false,
  is_available_now: false,
  available_overnight: false,
  available_for: [],
  services: { ...DEFAULT_SERVICE_FLAGS },
})

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [userRole, setUserRole] = useState('user')
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    phone: '',
    bio: '',
  })
  const [searchProfile, setSearchProfile] = useState(() => emptySearchProfileForm())
  
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth?redirect=/profile/edit')
      return
    }

    const load = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserRole(user.role || 'user')
          setFormData({
            nickname: user.nickname || '',
            email: user.email || '',
            phone: user.phone || '',
            bio: user.bio || '',
          })
        } catch {}
      }

      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.data) {
          const u = data.data
          setUserRole(u.role || 'user')
          setFormData((prev) => ({
            ...prev,
            nickname: u.nickname ?? prev.nickname,
            email: u.email ?? prev.email,
            phone: u.phone ?? prev.phone,
            bio: u.bio ?? prev.bio,
          }))
          if (u.advertiser_search_profile && typeof u.advertiser_search_profile === 'object') {
            setSearchProfile({
              ...emptySearchProfileForm(),
              ...u.advertiser_search_profile,
              services: {
                ...DEFAULT_SERVICE_FLAGS,
                ...(u.advertiser_search_profile.services || {}),
              },
              available_for: Array.isArray(u.advertiser_search_profile.available_for)
                ? u.advertiser_search_profile.available_for
                : [],
            })
          }
        }
      } catch {
        // keep localStorage fallback
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(false)
  }

  const updateSearchField = (name, value) => {
    setSearchProfile((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      const body =
        userRole === 'advertiser'
          ? {
              ...formData,
              advertiser_search_profile: buildFilterProfilePayload(searchProfile),
            }
          : { ...formData }

      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      
      if (data.success) {
        // Aggiorna localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...storedUser, ...formData }
        if (data.data?.advertiser_search_profile) {
          updatedUser.advertiser_search_profile = data.data.advertiser_search_profile
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setSuccess(true)
      } else {
        setError(data.error || 'Errore nel salvataggio')
      }
    } catch (err) {
      setError('Errore di rete')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('Le password non coincidono')
      return
    }
    
    if (passwordData.new.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setPasswordData({ current: '', new: '', confirm: '' })
        setShowPasswordSection(false)
        setSuccess(true)
      } else {
        setError(data.error || 'Errore nel cambio password')
      }
    } catch (err) {
      setError('Errore di rete')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Modifica profilo</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-pink-600 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
            Salva
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm flex items-center gap-2">
            <Save size={18} />
            Modifiche salvate con successo!
          </div>
        )}

        {/* Avatar */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {formData.nickname?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition">
                <Camera size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Clicca per cambiare foto</p>
          </div>
        </section>

        {userRole === 'advertiser' && (
          <section className="bg-white rounded-2xl border border-pink-200 p-5 shadow-sm space-y-4 ring-1 ring-pink-100">
            <div>
              <h2 className="font-semibold text-gray-900">Profilo per ricerca (filtri visitatore)</h2>
              <p className="text-sm text-gray-500 mt-1">
                Questi dati valgono per <strong>tutti i tuoi annunci</strong>. Salvi qui una volta sola:
                vengono applicati automaticamente a ogni annuncio e aggiornano anche quelli già pubblicati.
              </p>
            </div>
            <AdvertiserFilterProfileFields
              formData={searchProfile}
              updateField={updateSearchField}
              setFormData={setSearchProfile}
            />
          </section>
        )}

        {/* Info */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Informazioni personali</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <User size={14} className="inline mr-1" />
                Nome utente
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => updateField('nickname', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                placeholder="Il tuo nome"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <Mail size={14} className="inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                placeholder="email@esempio.it"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <Phone size={14} className="inline mr-1" />
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                placeholder="+39 333 1234567"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 resize-none"
                placeholder="Scrivi qualcosa su di te..."
              />
            </div>
          </div>
        </section>

        {/* Password */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Lock size={18} className="text-gray-400" />
              <span className="font-semibold text-gray-900">Cambia password</span>
            </div>
            <span className="text-pink-500 text-sm font-medium">
              {showPasswordSection ? 'Chiudi' : 'Modifica'}
            </span>
          </button>
          
          {showPasswordSection && (
            <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password attuale</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nuova password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Conferma password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                disabled={saving || !passwordData.current || !passwordData.new}
                className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cambia password
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

