'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit, Trash2, Eye, Heart, MessageCircle, 
  MapPin, Clock, Crown, Check, AlertCircle,
  TrendingUp, Calendar, Settings, Pause, Play, Loader2, Film, Upload
} from 'lucide-react'

import { getApiUrl, getApiOrigin, toAbsoluteMediaUrl } from '../../lib/runtime-api'
import OptimizedImage from '../../components/OptimizedImage'
import { MEDIA_SIZES, validateMediaFile } from '../../lib/media'
import { deleteReelMedia, uploadReelToAnnouncement } from '../../lib/reelMedia'
import { isAdvertiserSearchProfileIncomplete } from '../../lib/announcementFilterProfile'
import { buildAuthHref } from '../../lib/authRedirect'

const API_URL = getApiUrl()

export default function MyAnnouncementsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showPendingNotice = searchParams.get('pending') === '1'
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, views: 0, contacts: 0 })
  const [reelUploadTarget, setReelUploadTarget] = useState(null)
  const [reelBusyId, setReelBusyId] = useState(null)
  const reelFileInputRef = useRef(null)
  const [searchProfileIncomplete, setSearchProfileIncomplete] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push(buildAuthHref({ redirect: '/my-announcements' }))
      return
    }
    fetchMyAnnouncements()
  }, [])

  useEffect(() => {
    const loadAdvertiserSearchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success && data.data?.role === 'advertiser') {
          setSearchProfileIncomplete(
            isAdvertiserSearchProfileIncomplete(data.data.advertiser_search_profile)
          )
        } else {
          setSearchProfileIncomplete(false)
        }
      } catch {
        setSearchProfileIncomplete(false)
      }
    }
    loadAdvertiserSearchProfile()
  }, [])

  const fetchMyAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      const res = await fetch(`${API_URL}/announcements/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push(buildAuthHref({ redirect: '/my-announcements' }))
          return
        }
        throw new Error('Errore nel caricamento')
      }
      
      const data = await res.json()
      
      if (data.success) {
        setAnnouncements(data.data || [])
        // Calcola stats
        const total = data.data?.length || 0
        const active = data.data?.filter(a => a.status === 'active').length || 0
        const views = data.data?.reduce((acc, a) => acc + (a.views_count || 0), 0) || 0
        const contacts = data.data?.reduce((acc, a) => acc + (a.contacts_count || 0), 0) || 0
        setStats({ total, active, views, contacts })
      }
    } catch (err) {
      console.error('Errore:', err)
      setError('Impossibile caricare i tuoi annunci')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      const token = localStorage.getItem('token')
      
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id))
        setShowDeleteModal(null)
      } else {
        throw new Error('Errore eliminazione')
      }
    } catch (err) {
      console.error('Errore:', err)
      alert('Impossibile eliminare l\'annuncio')
    } finally {
      setDeleting(false)
    }
  }

  const getReelMedia = (announcement) =>
    announcement.media?.find((item) => item.is_reel && item.type === 'video')

  const handleReelFileChange = async (event) => {
    const file = event.target.files?.[0]
    const announcementId = reelUploadTarget
    event.target.value = ''
    setReelUploadTarget(null)
    if (!file || !announcementId) return

    const validationError = validateMediaFile(file)
    if (validationError) {
      alert(validationError)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push(buildAuthHref({ redirect: '/my-announcements' }))
      return
    }

    setReelBusyId(announcementId)
    try {
      await uploadReelToAnnouncement(token, announcementId, file)
      await fetchMyAnnouncements()
      alert('Reel pubblicato nel feed Reels e visibile sul profilo.')
    } catch (err) {
      alert(err.message || 'Errore caricamento reel')
    } finally {
      setReelBusyId(null)
    }
  }

  const handleDeleteReel = async (announcement) => {
    const reel = getReelMedia(announcement)
    if (!reel?.id) return
    if (!window.confirm('Eliminare il reel di questo annuncio?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    setReelBusyId(announcement.id)
    try {
      await deleteReelMedia(token, reel.id)
      await fetchMyAnnouncements()
    } catch (err) {
      alert(err.message || 'Errore eliminazione reel')
    } finally {
      setReelBusyId(null)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      
      const res = await fetch(`${API_URL}/announcements/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        setAnnouncements(prev => prev.map(a => 
          a.id === id ? { ...a, status: newStatus } : a
        ))
      }
    } catch (err) {
      console.error('Errore:', err)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Attivo
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Pause size={12} />
            In pausa
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock size={12} />
            In attesa
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle size={12} />
            Rifiutato
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-500">Caricamento annunci...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      <input
        ref={reelFileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleReelFileChange}
      />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">I miei annunci</h1>
          </div>
          <Link
            href="/announcements/new"
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition"
          >
            <Plus size={18} />
            Nuovo
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {searchProfileIncomplete && (
          <div className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl p-4 text-sm">
            Per comparire nei <strong>filtri di ricerca</strong> (capelli, servizi, disponibilità, ecc.),
            vai su{' '}
            <Link href="/profile/edit" className="font-semibold text-pink-600 underline">
              Modifica profilo
            </Link>{' '}
            e compila <strong>Profilo per ricerca</strong> (una volta sola per tutti gli annunci).
          </div>
        )}

        {showPendingNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
            Annuncio inviato. Resta in <strong>attesa di approvazione</strong> admin: comparirà in
            homepage dopo l&apos;approvazione da Admin Panel.
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Annunci totali</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">Attivi</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.views.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Visualizzazioni</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-pink-600">{stats.contacts}</div>
            <div className="text-sm text-gray-500">Contatti</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="text-pink-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nessun annuncio</h2>
            <p className="text-gray-500 mb-6">Crea il tuo primo annuncio per iniziare!</p>
            <Link
              href="/announcements/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition"
            >
              <Plus size={20} />
              Crea annuncio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(announcement => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-pink-300 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 h-48 sm:h-auto relative bg-gray-100">
                    <OptimizedImage
                      media={announcement.media?.[0]}
                      alt={announcement.title}
                      variant="thumb"
                      sizes={MEDIA_SIZES.card}
                      className="w-full h-full object-cover"
                    />
                    {announcement.is_vip && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Crown size={12} />
                        VIP
                      </div>
                    )}
                    {announcement.is_verified && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                        <Check size={12} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            {announcement.title || announcement.stage_name}
                          </h3>
                          {getStatusBadge(announcement.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {announcement.city?.name || 'N/D'}
                          </span>
                          <span>•</span>
                          <span>{announcement.age} anni</span>
                          {announcement.price_1hour && (
                            <>
                              <span>•</span>
                              <span className="text-pink-500 font-semibold">€{announcement.price_1hour}/h</span>
                            </>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {announcement.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={14} />
                            {announcement.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            {announcement.contacts_count || 0}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Calendar size={14} />
                            {new Date(announcement.created_at).toLocaleDateString('it-IT')}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {getReelMedia(announcement) ? (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                                <Film size={12} />
                                Reel attivo
                              </span>
                              <Link
                                href="/reels"
                                className="text-xs text-pink-600 hover:underline"
                              >
                                Vedi nel feed
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteReel(announcement)}
                                disabled={reelBusyId === announcement.id}
                                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                              >
                                <Trash2 size={12} />
                                Elimina reel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReelUploadTarget(announcement.id)
                                reelFileInputRef.current?.click()
                              }}
                              disabled={reelBusyId === announcement.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1.5 rounded-full disabled:opacity-50"
                            >
                              {reelBusyId === announcement.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Upload size={12} />
                              )}
                              Carica reel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                            announcement.status === 'active'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {announcement.status === 'active' ? (
                            <>
                              <Pause size={16} aria-hidden />
                              In pausa
                            </>
                          ) : (
                            <>
                              <Play size={16} aria-hidden />
                              Attiva
                            </>
                          )}
                        </button>
                        <Link
                          href={`/profile/${announcement.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                          <Eye size={16} aria-hidden />
                          Visualizza
                        </Link>
                        <Link
                          href={`/announcements/${announcement.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          <Edit size={16} aria-hidden />
                          Modifica
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(announcement.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                          aria-label="Elimina annuncio"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Premium Info */}
                    {announcement.premium_level && announcement.premium_level !== 'basic' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Piano attivo:</span>
                          <span className={`font-semibold ${
                            announcement.premium_level === 'vip' ? 'text-amber-600' : 'text-purple-600'
                          }`}>
                            {announcement.premium_level.toUpperCase()}
                          </span>
                        </div>
                        {announcement.plan_end_date && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-500">Scadenza:</span>
                            <span className="text-gray-700">
                              {new Date(announcement.plan_end_date).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {announcements.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Azioni rapide</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/announcements/new"
                className="flex items-center gap-2 p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition"
              >
                <Plus size={20} />
                <span className="text-sm font-medium">Nuovo annuncio</span>
              </Link>
              <Link
                href="/reels?upload=1"
                className="flex items-center gap-2 p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition"
              >
                <Film size={20} />
                <span className="text-sm font-medium">Carica reel</span>
              </Link>
              <Link
                href="/payments"
                className="flex items-center gap-2 p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition"
              >
                <Crown size={20} />
                <span className="text-sm font-medium">Upgrade VIP</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <Settings size={20} />
                <span className="text-sm font-medium">Impostazioni</span>
              </Link>
              <button
                onClick={fetchMyAnnouncements}
                className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
              >
                <TrendingUp size={20} />
                <span className="text-sm font-medium">Aggiorna stats</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Elimina annuncio?</h3>
              <p className="text-gray-500 mb-6">
                Questa azione è irreversibile. L&apos;annuncio e tutte le sue statistiche verranno eliminati.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                  disabled={deleting}
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
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
