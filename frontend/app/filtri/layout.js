import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Filtri e ricerca',
  description:
    'Filtra gli annunci Find Miss per età, città, prezzo, disponibilità e molto altro.',
  path: '/filtri',
})

export default function FiltriLayout({ children }) {
  return children
}
