import Link from 'next/link'
import { faqJsonLd } from '../../lib/seo'
import { SITE_FAQ } from '../../lib/siteFaq'

export default function FaqPage() {
  const jsonLd = faqJsonLd(SITE_FAQ)

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <div className="min-h-screen bg-[#FAFAFA] pb-24">
        <header className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link href="/menu" className="text-sm text-gray-500 hover:text-pink-600">
              ← Menu
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Domande frequenti</h1>
            <p className="text-sm text-gray-600 mt-1">
              Risposte rapide su accesso, ricerca, sicurezza e regole della piattaforma.
            </p>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {SITE_FAQ.map((item) => (
            <article
              key={item.question}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-2">{item.question}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
            </article>
          ))}
          <p className="text-sm text-gray-500 pt-4">
            Ulteriori dettagli:{' '}
            <Link href="/come-funziona" className="text-pink-600 underline">
              Come funziona
            </Link>
            ,{' '}
            <Link href="/sicurezza" className="text-pink-600 underline">
              Sicurezza 18+
            </Link>
            ,{' '}
            <Link href="/policy" className="text-pink-600 underline">
              Privacy e termini
            </Link>
            .
          </p>
        </main>
      </div>
    </>
  )
}