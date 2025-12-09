'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, 
  Megaphone, Eye, Heart, MessageCircle, DollarSign, Loader2,
  Calendar, Download
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AdminReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // giorni

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth?redirect=/admin/reports')
      return
    }
    loadStats()
  }, [dateRange])

  const loadStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Carica statistiche
      const [statsRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/announcements?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      const statsData = await statsRes.json()
      const announcementsData = await announcementsRes.json()
      
      if (statsData.success) {
        const anns = announcementsData.data || []
        
        // Calcola statistiche avanzate
        const totalViews = anns.reduce((sum, a) => sum + (a.views_count || 0), 0)
        const totalLikes = anns.reduce((sum, a) => sum + (a.likes_count || 0), 0)
        const totalContacts = anns.reduce((sum, a) => sum + (a.contacts_count || 0), 0)
        const avgViewsPerAnnouncement = anns.length > 0 ? Math.round(totalViews / anns.length) : 0
        const avgLikesPerAnnouncement = anns.length > 0 ? Math.round(totalLikes / anns.length) : 0
        
        // Annunci per categoria
        const byCategory = {}
        anns.forEach(a => {
          const cat = a.category?.name || 'N/A'
          byCategory[cat] = (byCategory[cat] || 0) + 1
        })
        
        // Annunci per città
        const byCity = {}
        anns.forEach(a => {
          const city = a.city?.name || 'N/A'
          byCity[city] = (byCity[city] || 0) + 1
        })
        
        setStats({
          ...statsData.data,
          totalViews,
          totalLikes,
          totalContacts,
          avgViewsPerAnnouncement,
          avgLikesPerAnnouncement,
          byCategory,
          byCity,
          totalAnnouncements: anns.length
        })
      }
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Report e Statistiche</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="7">Ultimi 7 giorni</option>
              <option value="30">Ultimi 30 giorni</option>
              <option value="90">Ultimi 90 giorni</option>
              <option value="365">Ultimo anno</option>
            </select>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {stats && (
          <>
            {/* Statistiche Principali */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-blue-500" size={24} />
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                <p className="text-sm text-gray-500">Utenti Totali</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Megaphone className="text-pink-500" size={24} />
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAnnouncements || 0}</p>
                <p className="text-sm text-gray-500">Annunci Totali</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="text-purple-500" size={24} />
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">Visualizzazioni</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="text-red-500" size={24} />
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLikes?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">Like Totali</p>
              </div>
            </div>

            {/* Statistiche Dettagliate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">📊 Statistiche Annunci</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annunci Attivi</span>
                    <span className="font-medium">{stats.activeAnnouncements || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">In Attesa</span>
                    <span className="font-medium">{stats.pendingAnnouncements || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Media Views/Annuncio</span>
                    <span className="font-medium">{stats.avgViewsPerAnnouncement || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Media Like/Annuncio</span>
                    <span className="font-medium">{stats.avgLikesPerAnnouncement || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Contatti Totali</span>
                    <span className="font-medium">{stats.totalContacts?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">💰 Revenue</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue Totale</span>
                    <span className="font-medium">€{stats.totalRevenue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pagamenti Completati</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribuzione per Categoria */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">📂 Annunci per Categoria</h3>
              <div className="space-y-2">
                {Object.entries(stats.byCategory || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${(count / stats.totalAnnouncements) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribuzione per Città */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">🏙️ Annunci per Città</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats.byCity || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 12)
                  .map(([city, count]) => (
                    <div key={city} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{city}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

