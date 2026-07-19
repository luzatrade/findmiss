import './globals.css'
import ErrorBoundary from '../components/ErrorBoundary'
import { ToastProvider } from '../components/ToastProvider'
import ClientProviders from './components/ClientProviders'
import BottomNav from './components/BottomNav'
import AgeVerification from './components/AgeVerification'
import { buildMetadata, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, websiteJsonLd } from '../lib/seo'

const homeMeta = buildMetadata({
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  path: '/',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  ...homeMeta,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: homeMeta.description,
  applicationName: SITE_NAME,
  keywords: [
    'Find Miss',
    'annunci',
    'profili',
    'Italia',
    'città',
    'reels',
    'storie',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f12',
}

export default function RootLayout({ children }) {
  const jsonLd = websiteJsonLd()

  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Tenor+Sans&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-outfit antialiased">
        <ToastProvider>
          <ErrorBoundary>
            <ClientProviders>
              <AgeVerification />
              {children}
              <BottomNav />
            </ClientProviders>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  )
}
