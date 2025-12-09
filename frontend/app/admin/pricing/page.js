'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Plus, Trash2, Edit, Loader2, 
  Crown, Zap, Tag, Percent, Calendar, Check, X,
  DollarSign, Package, Sparkles
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function PricingAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('plans')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Piani Premium
  const [plans, setPlans] = useState([
    { id: 1, name: 'Base', slug: 'base', price: 0, duration_days: 30, features: ['1 annuncio', 'Visibilità standard'], is_active: true },
    { id: 2, name: 'Premium', slug: 'premium', price: 29.99, duration_days: 30, features: ['5 annunci', 'Visibilità aumentata', 'Badge Premium'], is_active: true },
    { id: 3, name: 'VIP', slug: 'vip', price: 79.99, duration_days: 30, features: ['Annunci illimitati', 'Top visibilità', 'Badge VIP', 'Supporto prioritario'], is_active: true },
  ])
  
  // Boost
  const [boosts, setBoosts] = useState([
    { id: 1, name: 'Boost 24h', price: 9.99, duration_hours: 24, multiplier: 2, is_active: true },
    { id: 2, name: 'Boost Settimanale', price: 29.99, duration_hours: 168, multiplier: 3, is_active: true },
    { id: 3, name: 'Highlight', price: 4.99, duration_hours: 72, multiplier: 1.5, is_active: true },
  ])
  
  // Codici Sconto
  const [discountCodes, setDiscountCodes] = useState([
    { id: 1, code: 'WELCOME20', discount_percent: 20, max_uses: 100, used_count: 12, expires_at: '2025-12-31', is_active: true },
    { id: 2, code: 'VIP50', discount_percent: 50, max_uses: 10, used_count: 3, expires_at: '2025-06-30', is_active: true },
  ])
  
  // Form nuovo codice
  const [newCode, setNewCode] = useState({
    code: '',
    discount_percent: 10,
    max_uses: 100,
    expires_at: ''
  })
  const [showNewCodeForm, setShowNewCodeForm] = useState(false)
  
  // Edit states
  const [editingPlan, setEditingPlan] = useState(null)
  const [editingBoost, setEditingBoost] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // In produzione, carica da API
      // const [plansRes, boostsRes, codesRes] = await Promise.all([...])
      
      // Per ora usa dati locali salvati in localStorage
      const savedPlans = localStorage.getItem('admin_plans')
      const savedBoosts = localStorage.getItem('admin_boosts')
      const savedCodes = localStorage.getItem('admin_discount_codes')
      
      if (savedPlans) setPlans(JSON.parse(savedPlans))
      if (savedBoosts) setBoosts(JSON.parse(savedBoosts))
      if (savedCodes) setDiscountCodes(JSON.parse(savedCodes))
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAll = () => {
    localStorage.setItem('admin_plans', JSON.stringify(plans))
    localStorage.setItem('admin_boosts', JSON.stringify(boosts))
    localStorage.setItem('admin_discount_codes', JSON.stringify(discountCodes))
    alert('✅ Configurazione salvata!')
  }

  const updatePlan = (id, field, value) => {
    setPlans(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const updateBoost = (id, field, value) => {
    setBoosts(prev => prev.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const addPlan = () => {
    const newPlan = {
      id: Date.now(),
      name: 'Nuovo Piano',
      slug: 'nuovo-piano',
      price: 0,
      duration_days: 30,
      features: [],
      is_active: true
    }
    setPlans(prev => [...prev, newPlan])
    setEditingPlan(newPlan.id)
  }

  const deletePlan = (id) => {
    if (confirm('Eliminare questo piano?')) {
      setPlans(prev => prev.filter(p => p.id !== id))
    }
  }

  const addBoost = () => {
    const newBoost = {
      id: Date.now(),
      name: 'Nuovo Boost',
      price: 0,
      duration_hours: 24,
      multiplier: 1.5,
      is_active: true
    }
    setBoosts(prev => [...prev, newBoost])
    setEditingBoost(newBoost.id)
  }

  const deleteBoost = (id) => {
    if (confirm('Eliminare questo boost?')) {
      setBoosts(prev => prev.filter(b => b.id !== id))
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCode(prev => ({ ...prev, code }))
  }

  const addDiscountCode = () => {
    if (!newCode.code) {
      alert('Inserisci un codice')
      return
    }
    
    const code = {
      id: Date.now(),
      ...newCode,
      used_count: 0,
      is_active: true
    }
    
    setDiscountCodes(prev => [...prev, code])
    setNewCode({ code: '', discount_percent: 10, max_uses: 100, expires_at: '' })
    setShowNewCodeForm(false)
  }

  const deleteCode = (id) => {
    if (confirm('Eliminare questo codice?')) {
      setDiscountCodes(prev => prev.filter(c => c.id !== id))
    }
  }

  const toggleCodeActive = (id) => {
    setDiscountCodes(prev => prev.map(c => 
      c.id === id ? { ...c, is_active: !c.is_active } : c
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">💰 Gestione Prezzi</h1>
          </div>
          <button
            onClick={saveAll}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition"
          >
            <Save size={18} />
            Salva Tutto
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'plans', icon: Crown, label: 'Piani Premium' },
            { id: 'boosts', icon: Zap, label: 'Boost' },
            { id: 'codes', icon: Tag, label: 'Codici Sconto' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* PIANI PREMIUM */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Piani Abbonamento</h2>
              <button
                onClick={addPlan}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
              >
                <Plus size={16} />
                Nuovo Piano
              </button>
            </div>

            <div className="grid gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.slug === 'vip' ? 'bg-amber-100' :
                        plan.slug === 'premium' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Crown size={24} className={
                          plan.slug === 'vip' ? 'text-amber-500' :
                          plan.slug === 'premium' ? 'text-purple-500' : 'text-gray-500'
                        } />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
                          className="font-bold text-lg text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-500 focus:outline-none"
                        />
                        <p className="text-sm text-gray-500">{plan.duration_days} giorni</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePlan(plan.id, 'is_active', !plan.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {plan.is_active ? 'Attivo' : 'Disattivo'}
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prezzo (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={plan.price}
                        onChange={(e) => updatePlan(plan.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-lg font-bold text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Durata (giorni)</label>
                      <input
                        type="number"
                        value={plan.duration_days}
                        onChange={(e) => updatePlan(plan.id, 'duration_days', parseInt(e.target.value) || 30)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Features (una per riga)</label>
                      <textarea
                        value={plan.features?.join('\n') || ''}
                        onChange={(e) => updatePlan(plan.id, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOST */}
        {activeTab === 'boosts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Opzioni Boost</h2>
              <button
                onClick={addBoost}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
              >
                <Plus size={16} />
                Nuovo Boost
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {boosts.map(boost => (
                <div key={boost.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-yellow-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateBoost(boost.id, 'is_active', !boost.is_active)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          boost.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {boost.is_active ? <Check size={14} /> : <X size={14} />}
                      </button>
                      <button
                        onClick={() => deleteBoost(boost.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={boost.name}
                    onChange={(e) => updateBoost(boost.id, 'name', e.target.value)}
                    className="font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-pink-500 focus:outline-none w-full mb-3"
                  />

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Prezzo (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={boost.price}
                        onChange={(e) => updateBoost(boost.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Durata (ore)</label>
                      <input
                        type="number"
                        value={boost.duration_hours}
                        onChange={(e) => updateBoost(boost.id, 'duration_hours', parseInt(e.target.value) || 24)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Moltiplicatore visibilità</label>
                      <input
                        type="number"
                        step="0.1"
                        value={boost.multiplier}
                        onChange={(e) => updateBoost(boost.id, 'multiplier', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CODICI SCONTO */}
        {activeTab === 'codes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Codici Sconto</h2>
              <button
                onClick={() => setShowNewCodeForm(true)}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
              >
                <Plus size={16} />
                Nuovo Codice
              </button>
            </div>

            {/* Form Nuovo Codice */}
            {showNewCodeForm && (
              <div className="bg-white rounded-xl border-2 border-pink-500 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="text-pink-500" size={20} />
                  Crea Nuovo Codice Sconto
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Codice</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCode.code}
                        onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="CODICE"
                      />
                      <button
                        onClick={generateCode}
                        className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                        title="Genera automatico"
                      >
                        <Sparkles size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Sconto (%)</label>
                    <input
                      type="number"
                      value={newCode.discount_percent}
                      onChange={(e) => setNewCode(prev => ({ ...prev, discount_percent: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Max utilizzi</label>
                    <input
                      type="number"
                      value={newCode.max_uses}
                      onChange={(e) => setNewCode(prev => ({ ...prev, max_uses: parseInt(e.target.value) || 100 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Scadenza</label>
                    <input
                      type="date"
                      value={newCode.expires_at}
                      onChange={(e) => setNewCode(prev => ({ ...prev, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowNewCodeForm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={addDiscountCode}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Crea Codice
                  </button>
                </div>
              </div>
            )}

            {/* Lista Codici */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Codice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Sconto</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Utilizzi</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discountCodes.map(code => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-bold">
                          {code.code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-600 font-bold">{code.discount_percent}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {code.used_count} / {code.max_uses}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {code.expires_at || 'Mai'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleCodeActive(code.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            code.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {code.is_active ? 'Attivo' : 'Disattivo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code.code)
                            alert('Codice copiato!')
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-1"
                          title="Copia"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => deleteCode(code.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {discountCodes.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nessun codice sconto creato
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

