'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Camera, Trash2, AlertCircle, CheckCircle2, MapPin, 
  Loader2, Sparkles, Heart, Users, Video, Info
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Categorie disponibili
const CATEGORIES = [
  { id: 'miss', name: 'Miss', icon: Heart, description: 'Donna' },
  { id: 'mr', name: 'Mr.', icon: Users, description: 'Uomo' },
  { id: 'tmiss', name: 'T-Miss', icon: Sparkles, description: 'Trans' },
  { id: 'virtual', name: 'Servizi Virtuali', icon: Video, description: 'Online' },
]

export default function NewAnnouncementPage() {
  const router = useRouter()
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    stage_name: '',
    age: '',
    category_id: '', // Cambiato da 'category' a 'category_id'
    category_slug: '', // Aggiunto per mappare con le categorie hardcoded
    city_id: '',
    description: '',
    price_30min: '',
    price_1hour: '',
    price_2hour: '',
    price_night: '',
    price_videochat: '',
    height: '',
    weight: '',
    hair_color: '',
    eye_color: '',
    cup_size: '',
    ethnicity: '',
    working_hours_start: '10:00',
    working_hours_end: '22:00',
  })
  
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState(1) // 1: categoria, 2: info base, 3: dettagli, 4: foto

  // Carica città e categorie
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth?redirect=/announcements/new')
      return
    }
    
    const loadData = async () => {
      try {
        const [citiesRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/cities`),
          fetch(`${API_URL}/categories`)
        ])
        
        const citiesData = await citiesRes.json()
        const categoriesData = await categoriesRes.json()
        
        if (citiesData.success) setCities(citiesData.data || [])
        if (categoriesData.success) setCategories(categoriesData.data || [])
      } catch (err) {
        console.error('Errore caricamento dati:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStep = (stepNum) => {
    const newErrors = {}
    
    if (stepNum === 1) {
      // Debug
      console.log('Validazione step 1:', { category_id: formData.category_id, category_slug: formData.category_slug })
      if (!formData.category_id && !formData.category_slug) {
        newErrors.category = 'Seleziona una categoria'
      }
    }
    
    if (stepNum === 2) {
      if (!formData.stage_name?.trim()) newErrors.stage_name = 'Nome d\'arte obbligatorio'
      if (!formData.age || Number(formData.age) < 18 || Number(formData.age) > 60) {
        newErrors.age = 'Età deve essere tra 18 e 60'
      }
      if (!formData.city_id) newErrors.city_id = 'Seleziona una città'
      if (!formData.description?.trim() || formData.description.length < 30) {
        newErrors.description = 'Descrizione di almeno 30 caratteri'
      }
    }
    
    if (stepNum === 3) {
      if (!formData.price_1hour || Number(formData.price_1hour) < 30) {
        newErrors.price_1hour = 'Prezzo orario obbligatorio (min 30€)'
      }
    }
    
    if (stepNum === 4) {
      if (photos.length === 0) newErrors.photos = 'Carica almeno una foto'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    console.log('nextStep chiamato, step corrente:', step)
    console.log('formData corrente:', formData)
    
    const isValid = validateStep(step)
    console.log('Validazione risultato:', isValid)
    console.log('Errori:', errors)
    
    if (isValid) {
      setStep(prev => {
        const next = Math.min(prev + 1, 4)
        console.log('Passaggio da step', prev, 'a step', next)
        // Scroll to top quando cambi step
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
        return next
      })
    } else {
      console.log('Validazione fallita, errori:', errors)
      // Scroll to error dopo che gli errori sono stati settati
      setTimeout(() => {
        const firstError = Object.keys(errors)[0]
        if (firstError) {
          const errorElement = document.querySelector(`[name="${firstError}"]`) || 
                              document.querySelector(`[data-field="${firstError}"]`)
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            errorElement.focus()
          }
        }
      }, 100)
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPhotos = [...photos, ...files].slice(0, 10) // Max 10 foto
    const previews = newPhotos.map((file) => URL.createObjectURL(file))

    setPhotos(newPhotos)
    setPhotoPreviews(previews)
    if (errors.photos) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.photos
        return newErrors
      })
    }
  }

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth?redirect=/announcements/new')
      return
    }

    setIsSubmitting(true)

    try {
      // Trova la categoria (usa category_id se disponibile, altrimenti cerca per slug)
      const selectedCategory = formData.category_id 
        ? categories.find(c => c.id === formData.category_id)
        : categories.find(c => c.slug === formData.category_slug)
      
      if (!selectedCategory) {
        setErrors({ submit: 'Categoria non valida' })
        setIsSubmitting(false)
        return
      }
      
      // Crea l'annuncio
      const res = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          category_id: selectedCategory.id,
          age: Number(formData.age),
          height: formData.height ? Number(formData.height) : null,
          weight: formData.weight ? Number(formData.weight) : null,
          price_30min: formData.price_30min ? Number(formData.price_30min) : null,
          price_1hour: Number(formData.price_1hour),
          price_2hour: formData.price_2hour ? Number(formData.price_2hour) : null,
          price_night: formData.price_night ? Number(formData.price_night) : null,
          price_videochat: formData.price_videochat ? Number(formData.price_videochat) : null,
          title: `${formData.stage_name} - ${cities.find(c => c.id === formData.city_id)?.name || ''}`
        })
      })

      const data = await res.json()

      if (data.success && data.data?.id) {
        // Upload foto se presenti
        if (photos.length > 0) {
          const uploadFormData = new FormData()
          photos.forEach((photo, index) => {
            uploadFormData.append('files', photo)
          })
          uploadFormData.append('announcement_id', data.data.id)
          
          await fetch(`${API_URL}/upload/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: uploadFormData
          })
        }
        
        router.push('/my-announcements?created=true')
      } else {
        setErrors({ submit: data.error || 'Errore nella creazione' })
      }
    } catch (err) {
      console.error('Errore:', err)
      setErrors({ submit: 'Errore di rete, riprova' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => step > 1 ? prevStep() : router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-semibold text-gray-900">Nuovo annuncio</h1>
            <p className="text-xs text-gray-500">Step {step} di 4</p>
          </div>
          <div className="w-10" />
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        {/* Error banner */}
        {errors.submit && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Step 1: Categoria */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scegli la categoria</h2>
              <p className="text-gray-500">Seleziona la categoria più adatta al tuo profilo</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {categories.length > 0 ? (
                categories.map(cat => {
                  // Trova l'icona corrispondente
                  const catConfig = CATEGORIES.find(c => c.id === cat.slug)
                  const Icon = catConfig?.icon || Sparkles
                  const isSelected = formData.category_id === cat.id
                  
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        console.log('Categoria selezionata:', cat)
                        // Aggiorna entrambi i campi in un'unica operazione
                        setFormData(prev => ({
                          ...prev,
                          category_id: cat.id,
                          category_slug: cat.slug
                        }))
                        // Rimuovi errori se presenti
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.category
                          return newErrors
                        })
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${isSelected ? 'text-pink-500' : 'text-gray-400'}`} />
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-500">{catConfig?.description || ''}</div>
                    </button>
                  )
                })
              ) : (
                // Fallback se categorie non caricate
                CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  const isSelected = formData.category_slug === cat.id
                  
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        console.log('Categoria fallback selezionata:', cat)
                        // Aggiorna il campo in un'unica operazione
                        setFormData(prev => ({
                          ...prev,
                          category_slug: cat.id
                        }))
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.category
                          return newErrors
                        })
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${isSelected ? 'text-pink-500' : 'text-gray-400'}`} />
                      <div className="font-semibold text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-500">{cat.description}</div>
                    </button>
                  )
                })
              )}
            </div>
            
            {errors.category && (
              <p className="text-center text-sm text-red-500">{errors.category}</p>
            )}
          </div>
        )}

        {/* Step 2: Info base */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Informazioni base</h2>
              <p className="text-gray-500 text-sm">Inserisci i dettagli principali del tuo profilo</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
              {/* Nome d'arte */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nome d'arte *</label>
                <input
                  type="text"
                  value={formData.stage_name}
                  onChange={(e) => updateField('stage_name', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 ${
                    errors.stage_name ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Es. Sofia, Marco, Luna..."
                />
                {errors.stage_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.stage_name}
                  </p>
                )}
              </div>

              {/* Età e Città */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Età *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 ${
                      errors.age ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="25"
                    min="18"
                    max="60"
                  />
                  {errors.age && (
                    <p className="text-xs text-red-500">{errors.age}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Città *</label>
                  <select
                    value={formData.city_id}
                    onChange={(e) => updateField('city_id', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 ${
                      errors.city_id ? 'border-red-400' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Seleziona città</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="text-xs text-red-500">{errors.city_id}</p>
                  )}
                </div>
              </div>

              {/* Descrizione */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Descrizione *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none ${
                    errors.description ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Descrivi te stessa/o e i tuoi servizi..."
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{errors.description || 'Min 30 caratteri'}</span>
                  <span>{formData.description.length}/500</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dettagli e prezzi */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Prezzi e dettagli</h2>
              <p className="text-gray-500 text-sm">Imposta le tue tariffe e caratteristiche</p>
            </div>
            
            {/* Prezzi */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Tariffe</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">30 minuti (€)</label>
                  <input
                    type="number"
                    value={formData.price_30min}
                    onChange={(e) => updateField('price_30min', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="70"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">1 ora (€) *</label>
                  <input
                    type="number"
                    value={formData.price_1hour}
                    onChange={(e) => updateField('price_1hour', e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm ${
                      errors.price_1hour ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="130"
                  />
                  {errors.price_1hour && (
                    <p className="text-xs text-red-500">{errors.price_1hour}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">2 ore (€)</label>
                  <input
                    type="number"
                    value={formData.price_2hour}
                    onChange={(e) => updateField('price_2hour', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="220"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Notte (€)</label>
                  <input
                    type="number"
                    value={formData.price_night}
                    onChange={(e) => updateField('price_night', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="500"
                  />
                </div>
              </div>

              {(formData.category_slug === 'virtual' || formData.category_id) && categories.find(c => c.id === formData.category_id)?.slug === 'virtual' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Videochat (€/min)</label>
                  <input
                    type="number"
                    value={formData.price_videochat}
                    onChange={(e) => updateField('price_videochat', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="3"
                  />
                </div>
              )}
            </div>

            {/* Caratteristiche fisiche */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Caratteristiche (opzionale)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Altezza (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="170"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="55"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Colore capelli</label>
                  <select
                    value={formData.hair_color}
                    onChange={(e) => updateField('hair_color', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <option value="">Seleziona</option>
                    <option value="nero">Nero</option>
                    <option value="castano">Castano</option>
                    <option value="biondo">Biondo</option>
                    <option value="rosso">Rosso</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Colore occhi</label>
                  <select
                    value={formData.eye_color}
                    onChange={(e) => updateField('eye_color', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <option value="">Seleziona</option>
                    <option value="marrone">Marrone</option>
                    <option value="verde">Verde</option>
                    <option value="azzurro">Azzurro</option>
                    <option value="grigio">Grigio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orari */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Orari disponibilità</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Dalle</label>
                  <input
                    type="time"
                    value={formData.working_hours_start}
                    onChange={(e) => updateField('working_hours_start', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Alle</label>
                  <input
                    type="time"
                    value={formData.working_hours_end}
                    onChange={(e) => updateField('working_hours_end', e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Foto */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Carica le foto</h2>
              <p className="text-gray-500 text-sm">Aggiungi foto di qualità per il tuo profilo</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Foto profilo</h3>
                  <p className="text-sm text-gray-500">{photos.length}/10 foto caricate</p>
                </div>
                {errors.photos && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.photos}
                  </span>
                )}
              </div>

              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-xl py-8 cursor-pointer bg-gray-50 transition">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
                  <Camera className="w-7 h-7 text-pink-500" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Carica foto</div>
                  <div className="text-sm text-gray-500">JPG, PNG fino a 10MB</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotosChange}
                />
              </label>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photoPreviews.map((src, index) => (
                    <div key={src + index} className="relative group">
                      <img
                        src={src}
                        alt={`Foto ${index + 1}`}
                        className="w-full aspect-[3/4] object-cover rounded-xl border border-gray-200"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Principale
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>La prima foto sarà usata come immagine principale. Usa foto di qualità per ottenere più contatti!</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer azione */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Indietro
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition"
            >
              Continua
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Pubblicazione...
                </>
              ) : (
                'Pubblica annuncio'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
