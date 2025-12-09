'use client'
import { useState, useEffect, use } from 'react'
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, MapPin, Calendar, Clock, Star, Check, X, ChevronLeft, ChevronRight, Play, Share2, Phone, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Map from '../../../components/Map'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const ProfilePage = ({ params }) => {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFullImage, setShowFullImage] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${API_URL}/announcements/${resolvedParams.id}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const a = data.data
          // Trasforma i dati dal backend al formato frontend
          setProfile({
            id: a.id,
            name: a.stage_name || a.title || 'Senza nome',
            age: a.age || 0,
            city: a.city?.name || 'N/D',
            verified: a.is_verified || false,
            vip: a.is_vip || false,
            rating: 4.5, // TODO: calcolare dalla media reviews
            views: a.views_count || 0,
            location: a.city?.latitude && a.city?.longitude 
              ? { lat: Number(a.city.latitude), lng: Number(a.city.longitude) }
              : { lat: 41.9028, lng: 12.4964 }, // Default Roma
            about: a.description || 'Nessuna descrizione disponibile.',
            phone: a.user?.phone_visible && a.user?.phone ? a.user.phone : null,
            whatsapp: a.user?.phone_visible && a.user?.phone ? a.user.phone : null,
            email: null,
            lastSeen: a.user?.last_login 
              ? new Date(a.user.last_login).toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit' })
              : 'N/D',
            online: false,
            coverImage: a.media?.[0]?.url || 'https://via.placeholder.com/1200x400?text=No+Cover',
            images: a.media?.length > 0 
              ? a.media.map(m => m.url || m.thumbnail_url)
              : ['https://via.placeholder.com/600x800?text=No+Image'],
            services: [
              a.price_30min && { name: 'Incontro 30 min', price: Number(a.price_30min), duration: '30min' },
              a.price_1hour && { name: 'Incontro 1 ora', price: Number(a.price_1hour), duration: '1h' },
              a.price_2hour && { name: 'Incontro 2 ore', price: Number(a.price_2hour), duration: '2h' },
              a.price_night && { name: 'Pernottamento', price: Number(a.price_night), duration: 'Notte' },
              a.price_videochat && { name: 'Videochat', price: Number(a.price_videochat), duration: 'Variabile' },
            ].filter(Boolean),
            availability: a.working_hours_start && a.working_hours_end 
              ? [{ day: 'Disponibilità', time: `${a.working_hours_start} - ${a.working_hours_end}` }]
              : [{ day: 'Orari', time: 'Su appuntamento' }],
            reviews: a.reviews?.map(r => ({
              id: r.id,
              author: r.reviewer?.nickname || 'Anonimo',
              rating: r.rating,
              date: new Date(r.created_at).toLocaleDateString('it-IT'),
              text: r.comment || '',
            })) || [],
            userLiked: a.userLiked || false,
          })
        } else {
          setError('Annuncio non trovato')
        }
      } catch (err) {
        console.error('Errore fetch profilo:', err)
        setError('Impossibile caricare il profilo')
      } finally {
        setIsLoading(false)
      }
    }

    if (resolvedParams.id) {
      fetchProfile()
    }
  }, [resolvedParams.id])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === profile.images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? profile.images.length - 1 : prevIndex - 1
    )
  }

  const handleImageClick = (index) => {
    setCurrentImageIndex(index)
    setShowFullImage(true)
    document.body.style.overflow = 'hidden'
  }

  const closeFullImage = () => {
    setShowFullImage(false)
    document.body.style.overflow = 'unset'
  }

  useEffect(() => {
    // Ripristina stato fullscreen
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    // Carica preferiti da localStorage
    if (typeof window === 'undefined' || !profile) return
    try {
      const stored = JSON.parse(window.localStorage.getItem('favorites') || '[]')
      const isFav = stored.includes(String(profile.id))
      setIsFavorite(isFav)
    } catch {
      // ignora errori di parsing
    }
  }, [profile?.id])

  const toggleFavorite = () => {
    if (typeof window === 'undefined' || !profile) return
    try {
      const stored = JSON.parse(window.localStorage.getItem('favorites') || '[]')
      let updated
      if (stored.includes(String(profile.id))) {
        updated = stored.filter((id) => id !== String(profile.id))
        setIsFavorite(false)
      } else {
        updated = [...stored, String(profile.id)]
        setIsFavorite(true)
      }
      window.localStorage.setItem('favorites', JSON.stringify(updated))
    } catch {
      // se qualcosa va storto, fallback solo su stato locale
      setIsFavorite((prev) => !prev)
    }
  }

  const formatViews = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return `${n}`
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-500">Caricamento profilo...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || 'Profilo non trovato'}</h2>
          <p className="text-gray-500 mb-4">Il profilo richiesto non esiste o non è disponibile.</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
          >
            Torna indietro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header stile Instagram */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              {profile.name}
              {profile.verified && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <Check className="w-3 h-3" /> Verificata
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Profile Header stile EscortForum, tono caldo violaceo/bordò */}
      <div className="bg-gradient-to-b from-[#1a0b1f] via-[#16061b] to-[#0b040f]">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-56 sm:h-72 lg:h-80 overflow-hidden rounded-b-2xl shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <img
              src={profile.coverImage}
              alt={profile.name}
              className="w-full h-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6411ad]/85 via-transparent to-[#ff3b8d]/75" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-fuchsia-400/80 shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
                  <img
                    src={profile.images[0]}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                  {profile.online && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="text-white space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    {profile.vip && (
                      <span className="bg-gradient-to-r from-amber-300 to-amber-500 text-black text-xs px-2 py-1 rounded-full font-semibold shadow-md">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-3 text-sm text-fuchsia-50/90">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {profile.city}
                    </span>
                    <span>•</span>
                    <span>{profile.age} anni</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {renderStars(profile.rating)}
                      <span className="ml-1 text-xs">{profile.rating.toFixed(1)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-fuchsia-100/80">
                    <span>{formatViews(profile.views)} visualizzazioni</span>
                    <span>Ultimo accesso: {profile.lastSeen}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                <button
                  onClick={toggleFavorite}
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium shadow-md border transition ${
                    isFavorite
                      ? 'bg-pink-500 text-white border-pink-500 shadow-[0_10px_25px_rgba(236,72,153,0.6)]'
                      : 'bg-white/95 text-gray-800 border-pink-200/80 hover:bg-pink-50'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-white text-white' : 'text-pink-500'
                    }`}
                  />
                  {isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                </button>
                <button className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium shadow-md bg-white/95 text-gray-900 border border-pink-100 hover:bg-pink-50">
                  <Share2 className="w-4 h-4" />
                  Condividi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery stile Instagram */}
      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4 lg:space-y-6">
        <div className="hidden lg:grid lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-6">
          {/* Colonna sinistra: info principali */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Informazioni</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nome</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Età</span>
                  <span className="font-medium">{profile.age} anni</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Città</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {profile.city}
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Telefono</span>
                  <a
                    href={`tel:${profile.phone}`}
                    className="font-medium text-pink-500 hover:underline"
                  >
                    {profile.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">WhatsApp</span>
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-green-600 hover:underline"
                  >
                    Chat
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Valutazione</h3>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">{renderStars(profile.rating)}</div>
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 text-xs">{formatViews(profile.views)} visualizzazioni</span>
              </div>
            </div>
          </aside>

          {/* Colonna centrale: galleria foto */}
          <section className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-black">
                <div className="aspect-[3/4] w-full max-h-[520px] overflow-hidden flex items-center justify-center bg-black">
                  <img
                    src={profile.images[currentImageIndex]}
                    alt={`${profile.name} ${currentImageIndex + 1}`}
                    className="max-h-[520px] w-auto object-cover cursor-pointer"
                    onClick={() => handleImageClick(currentImageIndex)}
                  />
                </div>
                {profile.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
              <div className="p-3 bg-[#FAFAFA] border-t border-gray-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {profile.images.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-20 rounded-md overflow-hidden border transition ${
                        index === currentImageIndex
                          ? 'border-pink-500 shadow-sm'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${profile.name} thumb ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Colonna destra: descrizione, servizi, orari, recensioni, mappa */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Descrizione</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.about}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Servizi e tariffe</h3>
              <div className="space-y-2 text-sm">
                {profile.services.map((service, index) => (
                  <div
                    key={service.name + index}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{service.name}</p>
                      <p className="text-xs text-gray-500">Durata: {service.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-pink-500">{service.price}€</p>
                      <p className="text-xs text-gray-500">a sessione</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Orari</h3>
              <div className="space-y-2 text-sm">
                {profile.availability.map((slot, index) => (
                  <div key={slot.day + index} className="flex items-center justify-between">
                    <span className="text-gray-600">{slot.day}</span>
                    <span className="font-medium text-gray-800">{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-800">Posizione</h3>
              <div className="h-40 rounded-lg overflow-hidden border border-gray-200">
                <Map center={profile.location} zoom={13} />
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile / tablet layout (stack) */}
        <div className="lg:hidden space-y-4">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Informazioni</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Nome</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Età</span>
                <span className="font-medium">{profile.age} anni</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Città</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {profile.city}
                </span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Telefono</span>
                <a
                  href={`tel:${profile.phone}`}
                  className="font-medium text-pink-500 hover:underline"
                >
                  {profile.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">WhatsApp</span>
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-green-600 hover:underline"
                >
                  Chat
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative bg-black">
              <div className="aspect-[3/4] w-full overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={profile.images[currentImageIndex]}
                  alt={`${profile.name} ${currentImageIndex + 1}`}
                  className="max-h-[480px] w-auto object-cover cursor-pointer"
                  onClick={() => handleImageClick(currentImageIndex)}
                />
              </div>
              {profile.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            <div className="p-3 bg-[#FAFAFA] border-t border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {profile.images.map((image, index) => (
                  <button
                    key={image + index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-14 h-18 rounded-md overflow-hidden border transition ${
                      index === currentImageIndex
                        ? 'border-pink-500 shadow-sm'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${profile.name} thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Descrizione</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {profile.about}
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Servizi e tariffe</h3>
            <div className="space-y-2 text-sm">
              {profile.services.map((service, index) => (
                <div
                  key={service.name + index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-xs text-gray-500">Durata: {service.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pink-500">{service.price}€</p>
                    <p className="text-xs text-gray-500">a sessione</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Orari</h3>
            <div className="space-y-2 text-sm">
              {profile.availability.map((slot, index) => (
                <div key={slot.day + index} className="flex items-center justify-between">
                  <span className="text-gray-600">{slot.day}</span>
                  <span className="font-medium text-gray-800">{slot.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-800">Posizione</h3>
            <div className="h-40 rounded-lg overflow-hidden border border-gray-200">
              <Map center={profile.location} zoom={13} />
            </div>
          </section>
        </div>

        {/* Sezione recensioni (comune) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-800">Recensioni</h3>
            <button className="text-xs font-medium text-pink-500 hover:underline">
              Aggiungi recensione
            </button>
          </div>
          {profile.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">Ancora nessuna recensione.</p>
          ) : (
            <div className="space-y-3">
              {profile.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-lg p-3 bg-[#FAFAFA]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {review.author}
                      </span>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Full Screen Image Viewer */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeFullImage}
            className="absolute top-4 right-4 text-white p-2 z-10 rounded-full bg-black/50 hover:bg-black/70"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={profile.images[currentImageIndex]}
              alt={`${profile.name} ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {profile.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer azioni stile EscortForum */}
      <footer className="sticky bottom-0 z-30 bg-white border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {profile.rating.toFixed(1)} / 5
            </span>
            <span>•</span>
            <span>{formatViews(profile.views)} visualizzazioni</span>
          </div>
          <div className="flex flex-1 sm:flex-none justify-between sm:justify-end gap-2">
            <a
              href={`tel:${profile.phone}`}
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-semibold shadow-md hover:bg-pink-600 transition"
            >
              <Phone className="w-4 h-4" /> Chiama
            </a>
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white text-sm font-semibold shadow-md hover:bg-green-600 transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-200 transition">
              <Share2 className="w-4 h-4" />
              Email
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium border border-gray-200 hover:bg-gray-200 transition">
              Segnala
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ProfilePage
