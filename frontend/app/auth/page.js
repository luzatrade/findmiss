'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Disabilita pre-rendering statico
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, Phone, User, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [role, setRole] = useState('user')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const resetFields = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setNickname('')
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetFields()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await res.json()
      
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Credenziali non valide')
        return
      }
      
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      setSuccess('Login effettuato!')
      setTimeout(() => {
        router.push(redirectTo)
      }, 500)
    } catch {
      setError('Errore di connessione')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!email || !password || !nickname) {
      setError('Compila tutti i campi')
      return
    }
    
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname, role }),
      })
      
      const data = await res.json()
      
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Registrazione fallita')
        return
      }
      
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      setSuccess('Account creato!')
      setTimeout(() => {
        router.push(redirectTo)
      }, 500)
    } catch {
      setError('Errore di connessione')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">
            {mode === 'login' ? 'Accedi' : 'Registrati'}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            FindMiss
          </h2>
          <p className="text-gray-500 mt-2">
            {mode === 'login' ? 'Bentornato!' : 'Crea il tuo account'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 text-sm animate-fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700 text-sm animate-fade-in">
            <Check size={18} />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome utente</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 bg-white"
                  placeholder="Il tuo nome"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 bg-white"
                placeholder="email@esempio.it"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {mode === 'register' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Conferma password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-500 bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tipo account</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      role === 'user' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Utente</div>
                    <div className="text-xs text-gray-500 mt-1">Cerca annunci</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('advertiser')}
                    className={`p-4 rounded-xl border-2 transition text-left ${
                      role === 'advertiser' 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Inserzionista</div>
                    <div className="text-xs text-gray-500 mt-1">Pubblica annunci</div>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-pink-500 hover:underline">
                Password dimenticata?
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'login' ? 'Accesso...' : 'Registrazione...'}
              </>
            ) : (
              mode === 'login' ? 'Accedi' : 'Crea account'
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {mode === 'login' ? 'Non hai un account?' : 'Hai già un account?'}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-pink-500 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        </div>

        {/* Terms */}
        {mode === 'register' && (
          <p className="mt-6 text-center text-xs text-gray-400">
            Registrandoti accetti i nostri{' '}
            <Link href="/policy" className="text-pink-500 hover:underline">
              Termini di servizio
            </Link>{' '}
            e{' '}
            <Link href="/policy" className="text-pink-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        )}
      </main>
    </div>
  )
}
