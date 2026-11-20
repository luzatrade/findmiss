import Link from 'next/link'

export default function SicurezzaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <header className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Sicurezza e tutela 18+</h1>
          <p className="text-sm text-gray-600 mt-1">
            Accesso riservato ai maggiorenni e regole chiare per contenuti e segnalazioni.
          </p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-amber-900 mb-2">Accesso solo 18+</h2>
          <p className="text-amber-900">
            L&apos;ingresso al sito richiede la conferma di aver compiuto 18 anni. Senza questa conferma non si accede ai
            contenuti. Il meccanismo di verifica età in overlay non viene modificato dalla presente pagina informativa.
          </p>
        </section>
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Contenuti e responsabilità</h2>
          <p>
            Gli inserzionisti sono responsabili di quanto pubblicano. Sono vietati contenuti illegali, offensivi o che
            violano diritti di terzi. Find Miss è una piattaforma di intermediazione tra utenti adulti consenzienti.
          </p>
        </section>
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Segnalazioni</h2>
          <p>
            Per segnalare un profilo, un messaggio o un contenuto che viola le regole, scrivi a{' '}
            <a href="mailto:support@findmiss.it" className="text-pink-600 underline">
              support@findmiss.it
            </a>{' '}
            con il riferimento al profilo. Il team può sospendere account che non rispettano i{' '}
            <Link href="/policy" className="text-pink-600 underline">
              termini e la privacy
            </Link>
            .
          </p>
        </section>
        <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Dati e connessione</h2>
          <p>
            Le password sono protette e il sito è servito tramite HTTPS. Per il trattamento dati consulta l&apos;informativa in{' '}
            <Link href="/policy" className="text-pink-600 underline">
              /policy
            </Link>{' '}
            e il testo completo in{' '}
            <Link href="/termini-condizioni.html" className="text-pink-600 underline">
              termini e condizioni
            </Link>
            .
          </p>
        </section>
        <p>
          <Link href="/faq" className="text-pink-600 underline">
            FAQ
          </Link>{' '}
          ·{' '}
          <Link href="/come-funziona" className="text-pink-600 underline">
            Come funziona
          </Link>
        </p>
      </main>
    </div>
  )
}