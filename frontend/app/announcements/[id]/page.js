import { permanentRedirect } from 'next/navigation'
import {
  announcementSeoFields,
  buildMetadata,
  fetchAnnouncementForSeo,
} from '../../../lib/seo'

export async function generateMetadata({ params }) {
  const announcement = await fetchAnnouncementForSeo(params.id)
  if (!announcement) {
    return buildMetadata({
      title: 'Annuncio non trovato',
      description: 'Questo annuncio non è disponibile su Find Miss.',
      path: `/profile/${params.id}`,
      noIndex: true,
    })
  }

  const fields = announcementSeoFields(announcement)
  return buildMetadata({
    title: fields.title,
    description: fields.description,
    path: fields.path,
    image: fields.image,
    type: 'article',
  })
}

export default function AnnouncementPage({ params }) {
  permanentRedirect(`/profile/${params.id}`)
}