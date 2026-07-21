import { groupCitiesByRegion } from '../../lib/italianCities'
import { breadcrumbJsonLd } from '../../lib/seo'
import CittaPageClient from './CittaPageClient'

export default function CittaPage() {
  const groupedRegions = groupCitiesByRegion()
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Città', path: '/citta' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <noscript>
        <nav aria-label="Città principali Italia" className="max-w-6xl mx-auto px-4 py-6">
          <h1>Annunci per città in Italia</h1>
          {groupedRegions.map(({ region, cities }) => (
            <section key={region}>
              <h2>{region}</h2>
              <ul>
                {cities.map((city) => (
                  <li key={city.slug}>
                    <a href={`/citta/${city.slug}`}>Annunci a {city.name}</a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </noscript>
      <CittaPageClient groupedRegions={groupedRegions} />
    </>
  )
}
