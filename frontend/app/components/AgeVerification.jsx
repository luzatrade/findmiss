'use client'

import { useState, useEffect } from 'react'

const COOKIE_NAME = 'age_verified'
const COOKIE_DURATION_DAYS = 30
const EXIT_URL = 'https://www.google.com'

export default function AgeVerification() {
  const [isChecking, setIsChecking] = useState(true) // Stato di caricamento
  const [isVerified, setIsVerified] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Controlla se l'età è già verificata
    const checkVerification = () => {
      // Parametro URL per forzare la visualizzazione (solo sviluppo)
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('reset_age') === '1') {
        // Cancella verifica per testing
        document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        try { localStorage.removeItem(COOKIE_NAME) } catch (e) {}
        window.history.replaceState({}, '', window.location.pathname)
        // Forza mostrare l'overlay
        setIsVerified(false)
        setIsChecking(false)
        document.body.style.overflow = 'hidden'
        return
      }

      // Controlla cookie
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${COOKIE_NAME}=`))
        ?.split('=')[1]

      if (cookieValue === 'true') {
        setIsVerified(true)
        setIsChecking(false)
        return
      }

      // Controlla localStorage
      try {
        const item = localStorage.getItem(COOKIE_NAME)
        if (item) {
          const data = JSON.parse(item)
          if (data.expiry && new Date().getTime() < data.expiry && data.value === 'true') {
            setIsVerified(true)
            setIsChecking(false)
            return
          }
        }
      } catch (e) {}

      // Non verificato - mostra overlay
      setIsVerified(false)
      setIsChecking(false)
      document.body.style.overflow = 'hidden'
    }

    // Piccolo delay per evitare flash durante hydration
    const timer = setTimeout(checkVerification, 50)
    
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

  const saveVerification = () => {
    // Salva cookie
    const date = new Date()
    date.setTime(date.getTime() + (COOKIE_DURATION_DAYS * 24 * 60 * 60 * 1000))
    document.cookie = `${COOKIE_NAME}=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`

    // Salva localStorage
    try {
      const expiry = new Date().getTime() + (COOKIE_DURATION_DAYS * 24 * 60 * 60 * 1000)
      localStorage.setItem(COOKIE_NAME, JSON.stringify({ value: 'true', expiry }))
    } catch (e) {}
  }

  const handleAccept = () => {
    saveVerification()
    setIsFadingOut(true)
    document.body.style.overflow = ''
    
    setTimeout(() => {
      setIsVerified(true)
    }, 300)
  }

  const handleExit = () => {
    window.location.href = EXIT_URL
  }

  // Non mostrare nulla durante il controllo iniziale o se già verificato
  if (isChecking || isVerified) return null

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ${
          isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-5 sm:p-6 text-center rounded-t-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E91E8C] via-[#8B5CF6] to-[#E91E8C]" />
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#E91E8C]" />
            <span className="font-tenor text-xl sm:text-2xl tracking-[0.3em] uppercase">
              <span className="text-white">FIND</span>
              <span className="text-[#E91E8C]">MISS</span>
            </span>
            <div className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#8B5CF6]" />
          </div>

          {/* Warning Icon */}
          <div 
            className="w-16 h-16 sm:w-[70px] sm:h-[70px] mx-auto mb-4 bg-gradient-to-br from-[#dc2626] to-[#b91c1c] rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold"
            style={{
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            18+
          </div>

          <h1 className="text-[#ef4444] text-xl sm:text-2xl font-extrabold uppercase tracking-wide mb-2">
            Accesso Riservato ai Maggiorenni
          </h1>
          <p className="text-[#fbbf24] text-base sm:text-lg font-semibold">
            ⚠️ Attenzione: contenuti per soli adulti
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 text-gray-800">
          {/* Intro */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 sm:p-5 mb-6">
            <p className="text-sm sm:text-base text-gray-700">
              Questo sito contiene materiale destinato esclusivamente a un pubblico adulto, incluse immagini, video, contenuti testuali e servizi di natura erotica con espliciti riferimenti sessuali.
            </p>
            <p className="mt-3 font-semibold text-red-600 text-sm sm:text-base">
              L'accesso e la navigazione sono severamente vietati ai minori di 18 anni.
            </p>
          </div>

          {/* Declarations */}
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#E91E8C] flex items-center gap-2">
            <span className="text-[#E91E8C]">▸</span>
            Prima di procedere, leggi attentamente
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Proseguendo nella navigazione di FindMiss, dichiari espressamente quanto segue:
          </p>

          <ul className="space-y-3">
            {[
              { num: '1', title: 'Maggiore età:', text: 'Sono maggiorenne secondo le leggi del Paese in cui risiedo (almeno 18 anni compiuti in Italia);' },
              { num: '2', title: 'Consenso alla visione:', text: 'I contenuti presenti su questo sito, di carattere esplicitamente sessuale, non offendono la mia sensibilità e acconsento liberamente e consapevolmente alla loro visione;' },
              { num: '3', title: 'Assunzione di responsabilità:', text: 'Mi assumo ogni responsabilità civile e penale in merito alla veridicità delle mie dichiarazioni ed esonero l\'Amministrazione del sito da qualsiasi responsabilità derivante da dichiarazioni mendaci da me rese;' },
              { num: '4', title: 'Conformità alle leggi locali:', text: 'Accetto che l\'accesso a questo sito e la visione dei suoi contenuti siano conformi alle leggi del Paese da cui mi sto connettendo.' },
            ].map((item) => (
              <li key={item.num} className="relative pl-12 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition text-sm sm:text-base">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-[#E91E8C] to-[#8B5CF6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {item.num}
                </span>
                <strong className="text-gray-900 block mb-1">{item.title}</strong>
                {item.text}
              </li>
            ))}
          </ul>

          {/* Info Section */}
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-6 mb-3 pb-2 border-b-2 border-[#E91E8C] flex items-center gap-2">
            <span className="text-[#E91E8C]">▸</span>
            Informativa dell'Amministrazione
          </h2>

          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-4 text-sm sm:text-base text-slate-600">
            <p>
              <strong className="text-slate-800">Natura del servizio:</strong> FindMiss è una piattaforma di hosting che fornisce spazio virtuale per la pubblicazione di annunci da parte di utenti terzi. Il sito non fornisce, organizza o gestisce i servizi pubblicizzati dagli inserzionisti.
            </p>
            <p>
              <strong className="text-slate-800">Provenienza dei contenuti:</strong> Tutto il materiale pubblicato (foto, video, testi) è fornito direttamente dagli inserzionisti, i quali dichiarano di essere titolari dei relativi diritti o di avere ottenuto le necessarie autorizzazioni. Gli inserzionisti si assumono la piena responsabilità civile e penale per i contenuti caricati.
            </p>
            <p>
              <strong className="text-slate-800">Controllo e moderazione:</strong> L'Amministrazione effettua controlli regolari sui contenuti pubblicati e rimuove tempestivamente materiale non conforme alle leggi italiane. Tuttavia, non è possibile garantire un controllo preventivo su ogni singolo contenuto caricato dagli utenti.
            </p>
            <p>
              <strong className="text-slate-800">Segnalazioni:</strong> Se riscontri contenuti che violano la dignità personale o professionale, sono utilizzati senza consenso, violano diritti di immagine, possono configurare reati (in particolare contenuti pedopornografici), o sono contrari alla normativa vigente, invia immediatamente una segnalazione a: <a href="mailto:abuse@findmiss.com" className="text-[#E91E8C] font-semibold hover:underline">abuse@findmiss.com</a>
            </p>
            <p>
              L'Amministrazione provvederà alla rimozione immediata del materiale segnalato e, ove necessario, alla denuncia alle Autorità competenti.
            </p>

            {/* Warning Box */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">🚫</span>
              <span className="text-red-800 font-semibold text-sm sm:text-base">
                Tutela dei minori: Qualsiasi contenuto che coinvolga o rappresenti minori in contesti sessuali viene rimosso immediatamente e segnalato alle Autorità di Polizia. La tolleranza per tali violazioni è ZERO.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          <h3 className="text-center text-base sm:text-lg font-bold text-gray-900 mb-5">
            Scegli come procedere:
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAccept}
              className="flex-1 py-4 px-6 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold uppercase tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base"
              style={{ boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
            >
              <span className="text-lg">✓</span>
              Accetto e sono maggiorenne
            </button>
            
            <button
              onClick={handleExit}
              className="flex-1 py-4 px-6 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold uppercase tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm sm:text-base"
              style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
            >
              <span className="text-lg">✕</span>
              Esci da questo sito
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 4px 30px rgba(220, 38, 38, 0.6);
          }
        }
      `}</style>
    </div>
  )
}

