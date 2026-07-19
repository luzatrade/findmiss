'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Settings, Save, Globe, Shield, Bell, 
  Database, Server, Mail, Key, Loader2, CheckCircle
} from 'lucide-react'

import { getApiUrl } from '../../../lib/runtime-api'

const API_URL = getApiUrl()

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpLoading, setTotpLoading] = useState(true)
  const [totpSetup, setTotpSetup] = useState(null)
  const [totpCode, setTotpCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [totpMessage, setTotpMessage] = useState(null)
  const [totpError, setTotpError] = useState(null)
  const [settings, setSettings] = useState({
    siteName: 'FindMiss',
    siteDescription: 'Piattaforma di annunci per adulti',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxAnnouncementsPerUser: 5,
    announcementApprovalRequired: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      router.push('/auth?redirect=/admin/settings')
      return
    }

    try {
      const user = JSON.parse(storedUser)
      if (user.role !== 'admin') {
        router.push('/')
        return
      }
      loadTwoFactorStatus(token)
    } catch {
      router.push('/auth?redirect=/admin/settings')
      return
    }

    // Carica impostazioni (se implementato backend)
    // loadSettings()
  }, [router])

  const loadTwoFactorStatus = async (token) => {
    try {
      setTotpLoading(true)
      const res = await fetch(`${API_URL}/admin/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTotpEnabled(Boolean(data.data.enabled))
      }
    } catch (error) {
      console.error('Errore 2FA status:', error)
    } finally {
      setTotpLoading(false)
    }
  }

  const startTwoFactorSetup = async () => {
    const token = localStorage.getItem('token')
    setTotpError(null)
    setTotpMessage(null)
    setTotpLoading(true)

    try {
      const res = await fetch(`${API_URL}/admin/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Errore configurazione Authenticator')
      }
      setTotpSetup(data.data)
      setTotpMessage('Scansiona il QR code con Google Authenticator, poi inserisci il codice.')
    } catch (error) {
      setTotpError(error.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const enableTwoFactor = async () => {
    const token = localStorage.getItem('token')
    setTotpError(null)
    setTotpMessage(null)
    setTotpLoading(true)

    try {
      const res = await fetch(`${API_URL}/admin/2fa/enable`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: totpCode }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Codice non valido')
      }
      setTotpEnabled(true)
      setTotpSetup(null)
      setTotpCode('')
      setTotpMessage('Authenticator attivato con successo.')
    } catch (error) {
      setTotpError(error.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const disableTwoFactor = async () => {
    const token = localStorage.getItem('token')
    setTotpError(null)
    setTotpMessage(null)
    setTotpLoading(true)

    try {
      const res = await fetch(`${API_URL}/admin/2fa/disable`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: totpCode, password: disablePassword }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Disattivazione fallita')
      }
      setTotpEnabled(false)
      setTotpSetup(null)
      setTotpCode('')
      setDisablePassword('')
      setTotpMessage('Authenticator disattivato.')
    } catch (error) {
      setTotpError(error.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      // Qui salveresti le impostazioni via API
      // await fetch(`${API_URL}/admin/settings`, { ... })
      
      // Simulazione salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Errore:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Impostazioni</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Salvato!' : 'Salva'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Authenticator Admin */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="text-pink-500" size={20} />
              <h2 className="font-semibold text-gray-900">Google Authenticator (Admin)</h2>
            </div>

            {totpError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {totpError}
              </div>
            )}
            {totpMessage && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {totpMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Stato 2FA</p>
                  <p className="text-sm text-gray-500">
                    {totpEnabled ? 'Attivo: login admin protetto da codice' : 'Non attivo'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${totpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {totpEnabled ? 'ATTIVO' : 'OFF'}
                </span>
              </div>

              {!totpEnabled && !totpSetup && (
                <button
                  onClick={startTwoFactorSetup}
                  disabled={totpLoading}
                  className="px-4 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-50"
                >
                  {totpLoading ? 'Caricamento...' : 'Configura Authenticator'}
                </button>
              )}

              {totpSetup && !totpEnabled && (
                <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50">
                  {totpSetup.qrCodeDataUrl && (
                    <img
                      src={totpSetup.qrCodeDataUrl}
                      alt="QR code Authenticator"
                      className="mx-auto w-48 h-48 rounded-lg border border-gray-200 bg-white p-2"
                    />
                  )}
                  <p className="text-xs text-gray-500 break-all">
                    Codice manuale: <span className="font-mono text-gray-700">{totpSetup.secret}</span>
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Codice a 6 cifre"
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center tracking-[0.3em] font-semibold"
                  />
                  <button
                    onClick={enableTwoFactor}
                    disabled={totpLoading || totpCode.length !== 6}
                    className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Attiva Authenticator
                  </button>
                </div>
              )}

              {totpEnabled && (
                <div className="space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Codice Authenticator"
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center tracking-[0.3em] font-semibold"
                  />
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Password admin"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <button
                    onClick={disableTwoFactor}
                    disabled={totpLoading || totpCode.length !== 6 || !disablePassword}
                    className="w-full px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    Disattiva Authenticator
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Impostazioni Generali */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-blue-500" size={20} />
              <h2 className="font-semibold text-gray-900">Impostazioni Generali</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Sito
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione Sito
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Impostazioni Utenti */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-green-500" size={20} />
              <h2 className="font-semibold text-gray-900">Impostazioni Utenti</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Registrazione Abilitata</p>
                  <p className="text-sm text-gray-500">Permetti nuovi utenti di registrarsi</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.registrationEnabled}
                    onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Approvazione Annunci Richiesta</p>
                  <p className="text-sm text-gray-500">Gli annunci devono essere approvati prima di essere pubblicati</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementApprovalRequired}
                    onChange={(e) => setSettings({...settings, announcementApprovalRequired: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Annunci per Utente
                </label>
                <input
                  type="number"
                  value={settings.maxAnnouncementsPerUser}
                  onChange={(e) => setSettings({...settings, maxAnnouncementsPerUser: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Impostazioni Sistema */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Server className="text-purple-500" size={20} />
              <h2 className="font-semibold text-gray-900">Impostazioni Sistema</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Modalità Manutenzione</p>
                  <p className="text-sm text-gray-500">Blocca l&apos;accesso al sito per tutti tranne admin</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Info Sistema */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database className="text-amber-500" size={20} />
              <h2 className="font-semibold text-gray-900">Informazioni Sistema</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">API URL</span>
                <span className="font-mono text-gray-700">{API_URL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ambiente</span>
                <span className="font-medium text-gray-700">Produzione</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Versione</span>
                <span className="font-medium text-gray-700">3.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
