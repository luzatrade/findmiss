import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Sicurezza e tutela 18+',
  description:
    'Find Miss è per maggiorenni: età minima 18 anni, regole sui contenuti, segnalazioni e contatti per privacy e assistenza.',
  path: '/sicurezza',
})

export default function SicurezzaLayout({ children }) {
  return children
}