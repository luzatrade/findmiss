import './globals.css'
import ErrorBoundary from '../components/ErrorBoundary'
import { ToastProvider } from '../components/ToastProvider'
import ClientProviders from './components/ClientProviders'
import BottomNav from './components/BottomNav'
import AgeVerification from './components/AgeVerification'

export const metadata = {
  title: 'Find Miss',
  description: 'Piattaforma di annunci',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Tenor+Sans&display=swap" rel="stylesheet" />
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
