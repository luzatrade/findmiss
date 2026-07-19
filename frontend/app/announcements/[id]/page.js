import {
  announcementSeoFields,
  buildMetadata,
  fetchAnnouncementForSeo,
} from '../../../lib/seo'
import AnnouncementDetailClient from './AnnouncementDetailClient'

export async function generateMetadata({ params }) {
  const announcement = await fetchAnnouncementForSeo(params.id)
  if (!announcement) {
    return buildMetadata({
      title: 'Annuncio non trovato',
      description: 'Questo annuncio non è disponibile su Find Miss.',
      path: `/announcements/${params.id}`,
      noIndex: true,
    })
  }

  const fields = announcementSeoFields(announcement)
  // Canonical verso /profile/[id] (URL pubblico principale)
  return buildMetadata({
    title: fields.title,
    description: fields.description,
    path: fields.path,
    image: fields.image,
    type: 'article',
  })
}

export default function AnnouncementPage({ params }) {
  return <AnnouncementDetailClient id={params.id} />
}
