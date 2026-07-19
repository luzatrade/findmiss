import {
  announcementSeoFields,
  buildMetadata,
  fetchAnnouncementForSeo,
  listingJsonLd,
} from '../../../lib/seo'
import ProfilePageClient from './ProfilePageClient'

export async function generateMetadata({ params }) {
  const announcement = await fetchAnnouncementForSeo(params.id)
  if (!announcement) {
    return buildMetadata({
      title: 'Profilo non trovato',
      description: 'Questo profilo non è disponibile su Find Miss.',
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
    type: 'profile',
  })
}

export default async function ProfilePage({ params }) {
  const announcement = await fetchAnnouncementForSeo(params.id)
  const fields = announcement ? announcementSeoFields(announcement) : null
  const jsonLd = fields ? listingJsonLd(announcement, fields) : null

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <ProfilePageClient id={params.id} />
    </>
  )
}
