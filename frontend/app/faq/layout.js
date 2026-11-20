import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Domande frequenti',
  description:
    'Risposte su Find Miss: età minima 18+, ricerca per città, profili pubblici, storie, segnalazioni e privacy.',
  path: '/faq',
  keywords: ['FAQ Find Miss', 'come funziona', 'annunci Italia', 'supporto'],
})

export default function FaqLayout({ children }) {
  return children
}