import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Storie',
  description: 'Storie aggiornate dai profili Find Miss. Scopri chi è online ora.',
  path: '/stories',
})

export default function StoriesLayout({ children }) {
  return children
}
