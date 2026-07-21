import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Annunci per città in Italia',
  description:
    'Esplora oltre 120 città italiane su Find Miss: Milano, Roma, Napoli, Torino, Firenze e tutte le principali città d\'Italia con pagine dedicate agli annunci.',
  path: '/citta',
  keywords: [
    'annunci per città',
    'annunci Italia',
    'Milano',
    'Roma',
    'Napoli',
    'Find Miss',
  ],
})

export default function CittaLayout({ children }) {
  return children
}
