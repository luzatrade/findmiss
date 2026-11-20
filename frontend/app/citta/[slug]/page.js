import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  breadcrumbJsonLd,
  buildMetadata,
  cityListingJsonLd,
  citySeoFields,
  fetchAnnouncementsByCitySlug,
  fetchCityForSeo,
} from '../../../lib/seo'
import { getItalianCityBySlug } from '../../../lib/italianCities'

export async function generateMetadata({ params }) {
  const city = await fetchCityForSeo(params.slug)
  if (!city?.slug) {
    return buildMetadata({
      title: 'Città non trovata',
      description: 'Località non disponibile nell’indice Find Miss.',
      path: `/citta/${params.slug}`,
      noIndex: true,
    })
  }
  const fields = citySeoFields(city)
  return buildMetadata({
    title: fields.title,
    description: fields.description,
    path: fields.path,
    keywords: fields.keywords,
  })
}

export default async function CittaSlugPage({ params }) {
  const city = await fetchCityForSeo(params.slug)
  const fallback = getItalianCityBySlug(params.slug)
  const resolved = city?.slug ? city : fallback
  if (!resolved?.slug) notFound()

  const fields = citySeoFields(resolved)
  const announcements = await fetchAnnouncementsByCitySlug(resolved.slug, 24)
  const profilePaths = announcements.map((item) => `/profile/${item.id}`)

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Città', path: '/citta' },
    { name: resolved.name, path: fields.path },
  ])
  const collectionLd = cityListingJsonLd(resolved.name, resolved.slug, profilePaths)

  const filtriHref = `/filtri?city=${encodeURIComponent(resolved.name)}`
  const regionLabel = resolved.region ? ` (${resolved.region})` : ''

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <div className="min-h-screen bg-[#FAFAFA] pb-24">
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-20 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <p className="text-sm text-gray-500 mb-1">
              <Link href="/" className="hover:text-pink-600">
                Home
              </Link>
              <span className="mx-1">/</span>
              <Link href="/citta" className="hover:text-pink-600">
                Città
              </Link>
            </p>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Annunci a {resolved.name}{regionLabel}</h1>
            <p className="text-sm text-gray-600 mb-4">
              Profili e annunci disponibili a {resolved.name} su Find Miss. Apri la ricerca avanzata per filtri aggiuntivi.
            </p>
            <Link
              href={filtriHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition"
            >
              Cerca a {resolved.name}
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <section aria-labelledby="city-profiles-heading">
            <h2 id="city-profiles-heading" className="text-lg font-semibold text-gray-900 mb-3">
              Profili in evidenza
            </h2>
            {announcements.length === 0 ? (
              <p className="text-gray-600 text-sm bg-white border border-gray-200 rounded-xl p-4">
                Nessun annuncio attivo in questo momento per {resolved.name}. Prova la{' '}
                <Link href={filtriHref} className="text-pink-600 underline">
                  ricerca
                </Link>{' '}
                o torna all&apos;
                <Link href="/citta" className="text-pink-600 underline">
                  elenco città
                </Link>
                .
              </p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0 m-0">
                {announcements.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/profile/${item.id}`}
                      className="block bg-white rounded-2xl border border-gray-200 hover:border-pink-300 p-4 transition"
                    >
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.stage_name || item.title || 'Profilo'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {item.category?.name || 'Annuncio'}
                        {item.age ? ` · ${item.age} anni` : ''}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="text-sm text-gray-600">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Altre località</h2>
            <p>
              Esplora tutte le città italiane nella pagina{' '}
              <Link href="/citta" className="text-pink-600 underline">
                Annunci per città
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  )
}