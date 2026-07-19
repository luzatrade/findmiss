import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Reels',
  description: 'Guarda i reels verticali degli annunci Find Miss, stile Shorts.',
  path: '/reels',
})

export default function ReelsLayout({ children }) {
  return children
}
