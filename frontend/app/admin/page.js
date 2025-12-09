'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Megaphone, CreditCard, Settings,
  BarChart3, Eye, Heart, MessageCircle, TrendingUp, 
  CheckCircle, XCircle, Clock, Trash2, Edit, Search,
  RefreshCw, ChevronRight, ArrowLeft, Loader2, AlertCircle,
  Radio, Film, Image, DollarSign
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth?redirect=/admin')
      return
    }
    
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        // Per ora permetti a tutti di vedere, in produzione: if (u.role !== 'admin')
        setUser(u)
      } catch {}
    }
    
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Carica statistiche
      const [announcementsRes, categoriesRes, citiesRes] = await Promise.all([
        fetch(`${API_URL}/announcements`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/cities?limit=100`)
      ])
      
      const announcementsData = await announcementsRes.json()
      const categoriesData = await categoriesRes.json()
      const citiesData = await citiesRes.json()
      
      const anns = announcementsData.data || []
      setAnnouncements(anns)
      
      // Calcola statistiche
      setStats({
        totalAnnouncements: anns.length,
        activeAnnouncements: anns.filter(a => a.status === 'active').length,
        pendingAnnouncements: anns.filter(a => a.status === 'pending').length,
        totalViews: anns.reduce((sum, a) => sum + (a.views_count || 0), 0),
        totalLikes: anns.reduce((sum, a) => sum + (a.likes_count || 0), 0),
        totalContacts: anns.reduce((sum, a) => sum + (a.contacts_count || 0), 0),
        categories: categoriesData.data?.length || 0,
        cities: citiesData.data?.length || 0,
        vipAnnouncements: anns.filter(a => a.is_vip).length,
        verifiedAnnouncements: anns.filter(a => a.is_verified).length,
      })
      
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAnnouncementStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/announcements/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      loadData()
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const deleteAnnouncement = async (id) => {
    if (!confirm('Eliminare questo annuncio?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadData()
    } catch (error) {
      console.error('Errore:', error)
    }
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw size={20} />
            </button>
            <span className="text-sm text-gray-500">{user?.email}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/admin/pricing" className="bg-gradient-to-br from-amber-400 to-orange-500 text-black rounded-xl p-4 hover:opacity-90 transition">
            <DollarSign size={24} className="mb-2" />
            <p className="font-bold">Gestione Prezzi</p>
            <p className="text-sm opacity-80">Piani, Boost, Sconti</p>
          </Link>
          <Link href="/admin/users" className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-4 hover:opacity-90 transition">
            <Users size={24} className="mb-2" />
            <p className="font-bold">Utenti</p>
            <p className="text-sm opacity-80">Gestisci account</p>
          </Link>
          <Link href="/admin/reports" className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-4 hover:opacity-90 transition">
            <BarChart3 size={24} className="mb-2" />
            <p className="font-bold">Report</p>
            <p className="text-sm opacity-80">Statistiche avanzate</p>
          </Link>
          <Link href="/admin/settings" className="bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-xl p-4 hover:opacity-90 transition">
            <Settings size={24} className="mb-2" />
            <p className="font-bold">Impostazioni</p>
            <p className="text-sm opacity-80">Configura il sito</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'announcements', icon: Megaphone, label: 'Annunci' },
            { id: 'api', icon: Settings, label: 'API Status' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Megaphone className="text-pink-500" size={24} />
                  <span className="text-xs text-green-500 font-medium">Totale</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAnnouncements}</p>
                <p className="text-sm text-gray-500">Annunci</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="text-green-500" size={24} />
                  <span className="text-xs text-green-500 font-medium">Attivi</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeAnnouncements}</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-amber-500" size={24} />
                  <span className="text-xs text-amber-500 font-medium">In attesa</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAnnouncements}</p>
                <p className="text-sm text-gray-500">Da approvare</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="text-blue-500" size={24} />
                  <span className="text-xs text-blue-500 font-medium">Views</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Visualizzazioni</p>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-red-500" size={20} />
                  <span className="text-sm text-gray-500">Like totali</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="text-purple-500" size={20} />
                  <span className="text-sm text-gray-500">Contatti</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-amber-500" size={20} />
                  <span className="text-sm text-gray-500">VIP</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.vipAnnouncements}</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-500" size={20} />
                  <span className="text-sm text-gray-500">Verificati</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedAnnouncements}</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Database</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Categorie</span>
                    <span className="font-medium">{stats.categories}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Città</span>
                    <span className="font-medium">{stats.cities}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">🔗 Quick Links</h3>
                <div className="flex flex-wrap gap-2">
                  <a href="http://localhost:3001" target="_blank" className="text-sm text-pink-500 hover:underline">API Base</a>
                  <a href="http://localhost:3001/api/announcements" target="_blank" className="text-sm text-pink-500 hover:underline">Annunci JSON</a>
                  <a href="http://localhost:3001/api/categories" target="_blank" className="text-sm text-pink-500 hover:underline">Categorie</a>
                  <a href="http://localhost:3001/api/cities" target="_blank" className="text-sm text-pink-500 hover:underline">Città</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Gestione Annunci ({announcements.length})</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Annuncio</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Città</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stato</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stats</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {announcements.map(ann => (
                    <tr key={ann.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                            {ann.media?.[0]?.url ? (
                              <img src={ann.media[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Image size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{ann.title || ann.stage_name}</p>
                            <p className="text-xs text-gray-500">{ann.age} anni • €{ann.price_1hour}/h</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ann.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ann.city?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ann.status === 'active' ? 'bg-green-100 text-green-700' :
                          ann.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          ann.status === 'paused' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ann.status === 'active' ? 'Attivo' :
                           ann.status === 'pending' ? 'In attesa' :
                           ann.status === 'paused' ? 'In pausa' : ann.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye size={12} />{ann.views_count || 0}</span>
                          <span className="flex items-center gap-1"><Heart size={12} />{ann.likes_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {ann.status === 'pending' && (
                            <button
                              onClick={() => updateAnnouncementStatus(ann.id, 'active')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Approva"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {ann.status === 'active' && (
                            <button
                              onClick={() => updateAnnouncementStatus(ann.id, 'paused')}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                              title="Pausa"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                          {ann.status === 'paused' && (
                            <button
                              onClick={() => updateAnnouncementStatus(ann.id, 'active')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Riattiva"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <Link
                            href={`/profile/${ann.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Visualizza"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => deleteAnnouncement(ann.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Elimina"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {announcements.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nessun annuncio trovato
              </div>
            )}
          </div>
        )}

        {/* API Status Tab */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">🔌 API Endpoints</h2>
              <div className="space-y-3">
                {[
                  { method: 'GET', path: '/api/announcements', desc: 'Lista annunci' },
                  { method: 'GET', path: '/api/categories', desc: 'Lista categorie' },
                  { method: 'GET', path: '/api/cities', desc: 'Lista città' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Login' },
                  { method: 'POST', path: '/api/auth/register', desc: 'Registrazione' },
                  { method: 'GET', path: '/api/chat/conversations', desc: 'Conversazioni (auth)' },
                  { method: 'GET', path: '/api/reels', desc: 'Feed reels' },
                  { method: 'GET', path: '/api/stories', desc: 'Storie' },
                  { method: 'GET', path: '/api/premium-plans', desc: 'Piani premium' },
                ].map((endpoint, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-gray-700 flex-1">{endpoint.path}</code>
                    <span className="text-xs text-gray-500">{endpoint.desc}</span>
                    <a
                      href={`http://localhost:3001${endpoint.path}`}
                      target="_blank"
                      className="text-pink-500 hover:text-pink-600"
                    >
                      <ChevronRight size={16} />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">⚡ WebSocket</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-600">Socket.IO attivo su ws://localhost:3001</span>
                </div>
                <p className="text-gray-500">Eventi: chat, live streaming, notifiche real-time</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">🗄️ Database</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• PostgreSQL con Prisma ORM</p>
                <p>• Tabelle: users, announcements, media, conversations, messages, payments, stories, live_streams...</p>
                <p>• Per gestire: <code className="bg-gray-100 px-2 py-1 rounded">npx prisma studio</code></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

