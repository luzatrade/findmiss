import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Annunci per città',
  description:
    'Esplora gli annunci Find Miss per città in tutta Italia. Trova profili vicino a te in pochi tap.',
  path: '/citta',
})

export default function CittaLayout({ children }) {
  return children
}
