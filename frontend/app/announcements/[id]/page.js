'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Heart, Share2, MapPin, Clock, Star, Phone, 
  MessageCircle, Camera, Check, Crown, Eye, ChevronLeft, 
  ChevronRight, X, Loader2, AlertCircle
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AnnouncementDetail({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)
  const [liked, setLiked] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnnouncement()
  }, [resolvedParams.id])

  const loadAnnouncement = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/announcements/${resolvedParams.id}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        const a = data.data
        setAnnouncement({
          id: a.id,
          title: a.title || a.stage_name || 'Senza titolo',
          stage_name: a.stage_name || '',
          age: a.age || 0,
          city: a.city?.name || 'N/D',
          price: a.price_1hour ? Number(a.price_1hour) : 0,
          price_30min: a.price_30min ? Number(a.price_30min) : null,
          price_2hour: a.price_2hour ? Number(a.price_2hour) : null,
          price_night: a.price_night ? Number(a.price_night) : null,
          verified: a.is_verified || false,
          vip: a.is_vip || false,
          rating: 4.8,
          reviews: a._count?.reviews || 0,
          views: a.views_count || 0,
          description: a.description || 'Nessuna descrizione disponibile.',
          images: a.media?.length > 0 
            ? a.media.map(m => m.url || m.thumbnail_url)
            : ['https://via.placeholder.com/600x800?text=No+Image'],
          features: {
            height: a.height ? `${a.height} cm` : null,
            weight: a.weight ? `${a.weight} kg` : null,
            hairColor: a.hair_color || null,
            eyeColor: a.eye_color || null,
            cupSize: a.cup_size || null,
            ethnicity: a.ethnicity || null,
          },
          phone: a.user?.phone || '+39 333 1234567',
          availability: a.working_hours_start && a.working_hours_end 
            ? `${a.working_hours_start} - ${a.working_hours_end}`
            : 'Su appuntamento',
          category: a.category?.name || 'Miss',
        })
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

  useEffect(() => {
    if (!announcement) return
    try {
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]')
      setLiked(stored.includes(String(announcement.id)))
    } catch {}
  }, [announcement?.id])

  const toggleLike = () => {
    if (!announcement) return
    try {
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]')
      let updated
      if (stored.includes(String(announcement.id))) {
        updated = stored.filter((id) => id !== String(announcement.id))
        setLiked(false)
      } else {
        updated = [...stored, String(announcement.id)]
        setLiked(true)
      }
      localStorage.setItem('favorites', JSON.stringify(updated))
    } catch {
      setLiked((prev) => !prev)
    }
  }

  const nextImage = () => {
    if (!announcement) return
    setCurrentImage((prev) => (prev === announcement.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    if (!announcement) return
    setCurrentImage((prev) => (prev === 0 ? announcement.images.length - 1 : prev - 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Annuncio non trovato'}</h2>
          <Link href="/" className="text-pink-500 hover:underline">Torna alla home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={toggleLike} className="p-2 hover:bg-gray-100 rounded-full transition">
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} className={liked ? 'text-red-500' : 'text-gray-700'} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Share2 size={24} className="text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Galleria */}
      <div className="relative bg-gray-100">
        <div className="aspect-[3/4] max-h-[70vh] relative">
          <img 
            src={announcement.images[currentImage]} 
            alt={announcement.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setShowFullImage(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {announcement.verified && (
              <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Check size={14} /> Verificata
              </span>
            )}
            {announcement.vip && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <Crown size={14} /> VIP
              </span>
            )}
          </div>

          {/* Navigation */}
          {announcement.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition">
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition">
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {announcement.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentImage ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {announcement.images.length > 1 && (
          <div className="bg-white p-3 flex gap-2 overflow-x-auto">
            {announcement.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition ${idx === currentImage ? 'border-pink-500' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-32">
        {/* Title & Price */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{announcement.title}</h1>
              <div className="flex items-center gap-3 text-gray-500">
                <span className="text-lg">{announcement.age} anni</span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {announcement.city}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-pink-500">€{announcement.price}</div>
              <div className="text-sm text-gray-500">all'ora</div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Star size={16} fill="currentColor" className="text-amber-400" />
              <span className="font-semibold text-gray-900">{announcement.rating}</span>
              <span>({announcement.reviews} recensioni)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Eye size={16} />
              <span>{announcement.views} visualizzazioni</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={24} className="text-green-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-green-700">Disponibile</div>
            <div className="text-sm text-green-600">{announcement.availability}</div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Descrizione</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{announcement.description}</p>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Tariffe</h2>
          <div className="grid grid-cols-2 gap-3">
            {announcement.price_30min && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500">30 minuti</div>
                <div className="text-xl font-bold text-pink-500">€{announcement.price_30min}</div>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500">1 ora</div>
              <div className="text-xl font-bold text-pink-500">€{announcement.price}</div>
            </div>
            {announcement.price_2hour && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500">2 ore</div>
                <div className="text-xl font-bold text-pink-500">€{announcement.price_2hour}</div>
              </div>
            )}
            {announcement.price_night && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-500">Notte</div>
                <div className="text-xl font-bold text-pink-500">€{announcement.price_night}</div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Caratteristiche</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(announcement.features).filter(([_, v]) => v).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">
                  {key === 'height' ? 'Altezza' : 
                   key === 'weight' ? 'Peso' : 
                   key === 'hairColor' ? 'Capelli' :
                   key === 'eyeColor' ? 'Occhi' :
                   key === 'cupSize' ? 'Coppa' :
                   key === 'ethnicity' ? 'Etnia' : key}
                </div>
                <div className="font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <a
            href={`tel:${announcement.phone}`}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
          >
            <Phone size={18} />
            Chiama
          </a>
          <button 
            onClick={() => {
              const token = localStorage.getItem('token')
              if (!token) {
                router.push('/auth')
                return
              }
              router.push(`/chat?announcement=${announcement.id}`)
            }}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
          >
            <MessageCircle size={18} />
            Chat
          </button>
          <a
            href={`https://wa.me/${announcement.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Ciao, sono interessato al tuo annuncio: ${announcement.title}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Full Screen Image */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => setShowFullImage(false)}>
          <button className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={28} />
          </button>
          <img src={announcement.images[currentImage]} alt="" className="max-w-full max-h-full object-contain" />
          {announcement.images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 p-3 bg-white/20 rounded-full">
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 p-3 bg-white/20 rounded-full">
                <ChevronRight size={28} className="text-white" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
