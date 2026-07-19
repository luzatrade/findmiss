import { buildMetadata } from '../../lib/seo'

export const metadata = buildMetadata({
  title: 'Privacy e policy',
  description: 'Informativa privacy, regole della community e condizioni d’uso di Find Miss.',
  path: '/policy',
})

export default function PolicyLayout({ children }) {
  return children
}
