const BASE_URL = 'https://www.findmiss.it';

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
          '/my-announcements',
          '/payments',
          '/profile/edit',
          '/announcements/new',
          '/stories/create',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
