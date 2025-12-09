'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Crown, Zap, Star, Check, X, CreditCard, 
  TrendingUp, Eye, Shield, Loader2, Sparkles, Rocket
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Piani disponibili
const PLANS = [
  {
    id: 'basic',
    name: 'Base',
    price: 0,
    period: 'Gratuito',
    icon: Star,
    color: 'gray',
    features: [
      { text: '1 annuncio attivo', included: true },
      { text: '5 foto per annuncio', included: true },
      { text: 'Visibilità standard', included: true },
      { text: 'Posizione in classifica', included: false },
      { text: 'Badge Verificato', included: false },
      { text: 'Statistiche avanzate', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    period: '/mese',
    icon: Zap,
    color: 'purple',
    popular: true,
    features: [
      { text: '5 annunci attivi', included: true },
      { text: '20 foto per annuncio', included: true },
      { text: 'Visibilità aumentata', included: true },
      { text: 'Top 10 in classifica', included: true },
      { text: 'Badge Verificato', included: true },
      { text: 'Statistiche avanzate', included: false },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 59.99,
    period: '/mese',
    icon: Crown,
    color: 'amber',
    features: [
      { text: 'Annunci illimitati', included: true },
      { text: 'Foto illimitate', included: true },
      { text: 'Massima visibilità', included: true },
      { text: 'Sempre in cima', included: true },
      { text: 'Badge VIP esclusivo', included: true },
      { text: 'Statistiche complete', included: true },
    ],
  },
]

// Boost disponibili
const BOOSTS = [
  {
    id: 'boost_24h',
    name: 'Boost 24 ore',
    description: 'Visibilità aumentata per 24 ore',
    price: 4.99,
    icon: Rocket,
  },
  {
    id: 'boost_week',
    name: 'Boost Settimanale',
    description: 'Top della pagina per 7 giorni',
    price: 19.99,
    icon: TrendingUp,
  },
  {
    id: 'highlight',
    name: 'Evidenzia',
    description: 'Bordo colorato per 3 giorni',
    price: 2.99,
    icon: Sparkles,
  },
]

export default function PaymentsPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState('basic')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('plans') // plans, boosts, history

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth?redirect=/payments')
      return
    }
    
    // Simula caricamento piano attuale
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId)
  }

  const handlePurchase = async () => {
    if (!selectedPlan) return
    
    setProcessing(true)
    
    // Simula processo di pagamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCurrentPlan(selectedPlan)
    setSelectedPlan(null)
    setProcessing(false)
    setShowSuccess(true)
    
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleBoostPurchase = async (boostId) => {
    setProcessing(true)
    
    // Simula acquisto boost
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setProcessing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Abbonamenti</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Piano attuale:</span>
            <span className={`text-sm font-bold ${
              currentPlan === 'vip' ? 'text-amber-600' : 
              currentPlan === 'premium' ? 'text-purple-600' : 'text-gray-600'
            }`}>
              {PLANS.find(p => p.id === currentPlan)?.name}
            </span>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-slide-down">
          <Check size={20} />
          Operazione completata!
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-full p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition ${
              activeTab === 'plans' 
                ? 'bg-pink-500 text-white shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Piani
          </button>
          <button
            onClick={() => setActiveTab('boosts')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition ${
              activeTab === 'boosts' 
                ? 'bg-pink-500 text-white shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Boost
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition ${
              activeTab === 'history' 
                ? 'bg-pink-500 text-white shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Storico
          </button>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <>
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scegli il tuo piano</h2>
              <p className="text-gray-500">Aumenta la visibilità e ottieni più contatti</p>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(plan => {
                const Icon = plan.icon
                const isCurrentPlan = currentPlan === plan.id
                const isSelected = selectedPlan === plan.id
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                    className={`relative bg-white rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-pink-500 shadow-lg shadow-pink-500/20' 
                        : isCurrentPlan
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Più popolare
                      </div>
                    )}
                    
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} /> Attivo
                      </div>
                    )}

                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      plan.color === 'amber' ? 'bg-amber-100' :
                      plan.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        plan.color === 'amber' ? 'text-amber-600' :
                        plan.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 text-sm">{plan.period}</span>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {!isCurrentPlan && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectPlan(plan.id)
                        }}
                        className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
                          isSelected
                            ? 'bg-pink-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? 'Selezionato' : 'Seleziona'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Purchase Button */}
            {selectedPlan && selectedPlan !== currentPlan && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Piano {PLANS.find(p => p.id === selectedPlan)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      €{PLANS.find(p => p.id === selectedPlan)?.price}/mese
                    </p>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={processing}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2 disabled:opacity-60"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Elaborazione...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Acquista ora
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Boosts Tab */}
        {activeTab === 'boosts' && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Boost il tuo annuncio</h2>
              <p className="text-gray-500">Aumenta la visibilità istantaneamente</p>
            </div>

            <div className="space-y-4">
              {BOOSTS.map(boost => {
                const Icon = boost.icon
                return (
                  <div
                    key={boost.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between hover:border-pink-300 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{boost.name}</h3>
                        <p className="text-sm text-gray-500">{boost.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBoostPurchase(boost.id)}
                      disabled={processing}
                      className="bg-pink-500 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-pink-600 transition disabled:opacity-60"
                    >
                      €{boost.price}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-2xl p-5 flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Pagamenti sicuri</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Tutti i pagamenti sono processati in modo sicuro attraverso gateway certificati. 
                  I tuoi dati sono protetti.
                </p>
              </div>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Storico acquisti</h2>
              <p className="text-gray-500">Le tue transazioni recenti</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nessun acquisto recente</p>
                <p className="text-sm text-gray-400 mt-1">I tuoi acquisti appariranno qui</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

