import { SITE_URL } from '../lib/seo'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/auth',
          '/chat',
          '/settings',
          '/saved',
          '/my-announcements',
          '/payments',
          '/menu',
          '/profile/edit',
          '/announcements/new',
          '/announcements/*/edit',
          '/stories/create',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
