import Link from 'next/link'
import { breadcrumbJsonLd } from '../../lib/seo'

export default function ComeFunzionaPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Come funziona', path: '/come-funziona' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <div className="min-h-screen bg-[#FAFAFA] pb-24">
        <header className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Come funziona Find Miss</h1>
            <p className="text-sm text-gray-600 mt-1">
              Panoramica del sito per chi cerca annunci e profili in Italia.
            </p>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-sm text-gray-600 leading-relaxed">
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Esplora la homepage</h2>
            <p>
              Dalla{' '}
              <Link href="/" className="text-pink-600 underline">
                home
              </Link>{' '}
              puoi sfogliare annunci recenti, aprire le storie e filtrare per categoria (Miss, Mr., T-Miss, servizi
              virtuali).
            </p>
          </section>
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Cerca per città</h2>
            <p>
              L&apos;indice{' '}
              <Link href="/citta" className="text-pink-600 underline">
                città italiane
              </Link>{' '}
              elenca le località con pagina dedicata. Ogni pagina locale rimanda alla{' '}
              <Link href="/filtri" className="text-pink-600 underline">
                ricerca avanzata
              </Link>{' '}
              con la città già impostata.
            </p>
          </section>
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Apri un profilo</h2>
            <p>
              Ogni annuncio pubblico ha una pagina profilo con foto, descrizione e dettagli inseriti dall&apos;inserzionista.
              L&apos;URL canonico è sempre del tipo <code className="text-xs bg-gray-100 px-1 rounded">/profile/[id]</code>.
            </p>
          </section>
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. Reels e storie</h2>
            <p>
              I contenuti multimediali sono nel feed{' '}
              <Link href="/reels" className="text-pink-600 underline">
                Reels
              </Link>{' '}
              e nella sezione{' '}
              <Link href="/stories" className="text-pink-600 underline">
                Storie
              </Link>
              , pubblicati dagli inserzionisti secondo le regole del sito.
            </p>
          </section>
          <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Accesso e pubblicazione</h2>
            <p>
              La consultazione degli annunci richiede la conferma dell&apos;età (18+). Per pubblicare annunci serve la
              registrazione tramite la pagina di accesso. Account, chat e pagamenti restano riservati agli utenti autenticati.
            </p>
          </section>
          <p>
            <Link href="/faq" className="text-pink-600 underline">
              Domande frequenti
            </Link>{' '}
            ·{' '}
            <Link href="/sicurezza" className="text-pink-600 underline">
              Sicurezza e tutela 18+
            </Link>
          </p>
        </main>
      </div>
    </>
  )
}