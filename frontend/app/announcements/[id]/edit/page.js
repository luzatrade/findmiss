'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Camera, Trash2, Loader2, Save, AlertCircle,
  Plus, GripVertical, X
} from 'lucide-react'

import { getApiUrl, getApiOrigin, toAbsoluteMediaUrl } from '../../../../lib/runtime-api'
import { buildAuthHref } from '../../../../lib/authRedirect'
import { uploadAnnouncementMediaFiles } from '../../../../lib/mediaUpload'
const API_URL = getApiUrl()

export default function EditAnnouncementPage({ params }) {
  const announcementId = params.id
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    stage_name: '',
    age: '',
    category_id: '',
    city_id: '',
    description: '',
    price_30min: '',
    price_1hour: '',
    price_2hour: '',
    price_night: '',
    working_hours_start: '10:00',
    working_hours_end: '22:00',
    status: 'active',
  })
  
  const [existingMedia, setExistingMedia] = useState([])
  const [newPhotos, setNewPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push(buildAuthHref({ redirect: '/my-announcements' }))
      return
    }
    loadData()
  }, [announcementId])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Carica dati annuncio, città e categorie in parallelo
      const [announcementRes, citiesRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/announcements/${announcementId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/cities`),
        fetch(`${API_URL}/categories`)
      ])
      
      const announcementData = await announcementRes.json()
      const citiesData = await citiesRes.json()
      const categoriesData = await categoriesRes.json()
      
      if (citiesData.success) setCities(citiesData.data || [])
      if (categoriesData.success) setCategories(categoriesData.data || [])
      
      if (announcementData.success && announcementData.data) {
        const a = announcementData.data
        setFormData({
          title: a.title || '',
          stage_name: a.stage_name || '',
          age: a.age?.toString() || '',
          category_id: a.category_id || '',
          city_id: a.city_id || '',
          description: a.description || '',
          price_30min: a.price_30min?.toString() || '',
          price_1hour: a.price_1hour?.toString() || '',
          price_2hour: a.price_2hour?.toString() || '',
          price_night: a.price_night?.toString() || '',
          working_hours_start: a.working_hours_start || '10:00',
          working_hours_end: a.working_hours_end || '22:00',
          status: a.status || 'active',
        })
        setExistingMedia(a.media || [])
      } else {
        setError('Annuncio non trovato')
      }
    } catch (err) {
      console.error('Errore:', err)
      setError('Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    const total = existingMedia.length + newPhotos.length + files.length
    if (total > 10) {
      alert('Puoi caricare massimo 10 foto')
      return
    }

    const newFiles = [...newPhotos, ...files]
    const previews = newFiles.map(file => URL.createObjectURL(file))
    
    setNewPhotos(newFiles)
    setPhotoPreviews(previews)
  }

  const removeExistingMedia = (mediaId) => {
    setExistingMedia(prev => prev.filter(m => m.id !== mediaId))
  }

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      
      // Aggiorna annuncio
      const res = await fetch(`${API_URL}/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          stage_name: formData.stage_name,
          description: formData.description,
          category_id: formData.category_id,
          city_id: formData.city_id,
          age: formData.age ? Number(formData.age) : null,
          price_30min: formData.price_30min ? Number(formData.price_30min) : null,
          price_1hour: formData.price_1hour ? Number(formData.price_1hour) : null,
          price_2hour: formData.price_2hour ? Number(formData.price_2hour) : null,
          price_night: formData.price_night ? Number(formData.price_night) : null,
          working_hours_start: formData.working_hours_start,
          working_hours_end: formData.working_hours_end,
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        if (newPhotos.length > 0) {
          await uploadAnnouncementMediaFiles(token, announcementId, newPhotos)
        }

        router.push('/my-announcements?updated=true')
      } else {
        setError(data.error || 'Errore nel salvataggio')
      }
    } catch (err) {
      console.error('Errore:', err)
      setError(err.message || 'Errore di rete')
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

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <Link href="/my-announcements" className="text-pink-500 hover:underline">
            Torna ai miei annunci
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/my-announcements" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Modifica annuncio</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-pink-500 text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-pink-600 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Foto */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Foto</h2>
          
          {/* Foto esistenti */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {existingMedia.map((media, index) => (
              <div key={media.id} className="relative group aspect-[3/4]">
                <img
                  src={toAbsoluteMediaUrl(media.url || media.thumbnail_url, getApiOrigin())}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border border-gray-200"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    Principale
                  </span>
                )}
                <button
                  onClick={() => removeExistingMedia(media.id)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* Nuove foto */}
            {photoPreviews.map((src, index) => (
              <div key={`new-${index}`} className="relative group aspect-[3/4]">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-xl border-2 border-dashed border-pink-300"
                />
                <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  Nuova
                </span>
                <button
                  onClick={() => removeNewPhoto(index)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            {/* Add photo button */}
            {existingMedia.length + newPhotos.length < 10 && (
              <label className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 transition">
                <Plus className="text-gray-400 mb-1" size={24} />
                <span className="text-xs text-gray-500">Aggiungi</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotosChange}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {existingMedia.length + newPhotos.length}/10 foto • La prima sarà l&apos;immagine principale
          </p>
        </section>

        {/* Info base */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Informazioni</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Nome d&apos;arte</label>
              <input
                type="text"
                value={formData.stage_name}
                onChange={(e) => updateField('stage_name', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Età</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Città</label>
              <select
                value={formData.city_id}
                onChange={(e) => updateField('city_id', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              >
                <option value="">Seleziona</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Categoria</label>
              <select
                value={formData.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              >
                <option value="">Seleziona</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Descrizione</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Prezzi */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Tariffe</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">30 min (€)</label>
              <input
                type="number"
                value={formData.price_30min}
                onChange={(e) => updateField('price_30min', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">1 ora (€)</label>
              <input
                type="number"
                value={formData.price_1hour}
                onChange={(e) => updateField('price_1hour', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">2 ore (€)</label>
              <input
                type="number"
                value={formData.price_2hour}
                onChange={(e) => updateField('price_2hour', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Notte (€)</label>
              <input
                type="number"
                value={formData.price_night}
                onChange={(e) => updateField('price_night', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
          </div>
        </section>

        <section className="bg-purple-50 rounded-2xl border border-purple-200 p-5 text-sm text-purple-900">
          <p className="font-semibold text-purple-950">Filtri di ricerca (capelli, servizi, ecc.)</p>
          <p className="mt-1 text-purple-800/90">
            Si impostano <strong>una sola volta</strong> nel tuo profilo, non su ogni annuncio.
          </p>
          <Link
            href="/profile/edit"
            className="inline-flex mt-3 text-pink-600 font-semibold hover:underline"
          >
            Apri Modifica profilo
          </Link>
        </section>

        {/* Orari */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900">Disponibilità</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Dalle</label>
              <input
                type="time"
                value={formData.working_hours_start}
                onChange={(e) => updateField('working_hours_start', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Alle</label>
              <input
                type="time"
                value={formData.working_hours_end}
                onChange={(e) => updateField('working_hours_end', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Stato annuncio</label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            >
              <option value="active">Attivo</option>
              <option value="paused">In pausa</option>
              <option value="draft">Bozza</option>
            </select>
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Link
            href="/my-announcements"
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-center hover:bg-gray-50 transition"
          >
            Annulla
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </div>
      </div>
    </div>
  )
}
