'use client'
import Link from 'next/link'
import { ArrowLeft, Shield, FileText, AlertTriangle, Mail, Phone } from 'lucide-react'

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Privacy e Termini</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Privacy Policy */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Informativa sulla Privacy</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              <strong className="text-gray-900">1. Raccolta dei dati</strong><br />
              Raccogliamo solo i dati necessari per fornire i nostri servizi: email, nome utente, 
              e informazioni relative agli annunci pubblicati. Non vendiamo i tuoi dati a terzi.
            </p>
            
            <p>
              <strong className="text-gray-900">2. Utilizzo dei dati</strong><br />
              I tuoi dati vengono utilizzati per: gestire il tuo account, mostrare i tuoi annunci, 
              permettere la comunicazione tra utenti, e migliorare i nostri servizi.
            </p>
            
            <p>
              <strong className="text-gray-900">3. Conservazione</strong><br />
              I dati vengono conservati per il tempo necessario a fornire i servizi e per adempiere 
              agli obblighi legali. Puoi richiedere la cancellazione in qualsiasi momento.
            </p>
            
            <p>
              <strong className="text-gray-900">4. Sicurezza</strong><br />
              Utilizziamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, 
              inclusa la crittografia delle password e connessioni sicure HTTPS.
            </p>
            
            <p>
              <strong className="text-gray-900">5. Cookie</strong><br />
              Utilizziamo cookie tecnici necessari per il funzionamento del sito e cookie analitici 
              per comprendere come viene utilizzato il servizio.
            </p>
          </div>
        </section>

        {/* Terms of Service */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Termini di Servizio</h2>
          </div>
          
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              <strong className="text-gray-900">1. Accettazione</strong><br />
              Utilizzando FindMiss, accetti questi termini di servizio. Se non accetti, 
              ti preghiamo di non utilizzare la piattaforma.
            </p>
            
            <p>
              <strong className="text-gray-900">2. Età minima</strong><br />
              Devi avere almeno 18 anni per utilizzare questa piattaforma. 
              La registrazione implica la conferma di essere maggiorenne.
            </p>
            
            <p>
              <strong className="text-gray-900">3. Contenuti</strong><br />
              Sei responsabile dei contenuti che pubblichi. È vietato pubblicare contenuti 
              illegali, offensivi, o che violano i diritti di terzi.
            </p>
            
            <p>
              <strong className="text-gray-900">4. Account</strong><br />
              Sei responsabile della sicurezza del tuo account. Non condividere le tue credenziali. 
              Ci riserviamo il diritto di sospendere account che violano i termini.
            </p>
            
            <p>
              <strong className="text-gray-900">5. Pagamenti</strong><br />
              I pagamenti per servizi premium sono gestiti attraverso gateway sicuri. 
              Le tariffe sono indicate chiaramente prima dell'acquisto.
            </p>
            
            <p>
              <strong className="text-gray-900">6. Limitazione di responsabilità</strong><br />
              FindMiss è una piattaforma di intermediazione. Non siamo responsabili per 
              le interazioni tra utenti o per i contenuti pubblicati dagli utenti.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">Disclaimer</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                FindMiss è una piattaforma di annunci per adulti consenzienti. 
                Tutti gli utenti devono essere maggiorenni. La piattaforma non promuove 
                né tollera attività illegali. Gli utenti sono responsabili delle proprie azioni.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contattaci</h2>
          <p className="text-gray-600 text-sm mb-4">
            Per domande relative alla privacy o ai termini di servizio:
          </p>
          <div className="space-y-3">
            <a 
              href="mailto:support@findmiss.it" 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <Mail size={20} className="text-pink-500" />
              <span className="text-gray-700">support@findmiss.it</span>
            </a>
          </div>
        </section>

        {/* Last updated */}
        <p className="text-center text-gray-400 text-sm py-4">
          Ultimo aggiornamento: Dicembre 2024
        </p>
      </main>
    </div>
  )
}
