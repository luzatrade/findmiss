import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Come funziona Find Miss',
  description:
    'Scopri come cercare annunci per città, consultare profili, reels e storie, e come accedere o registrarti come inserzionista su Find Miss.',
  path: '/come-funziona',
})

export default function ComeFunzionaLayout({ children }) {
  return children
}