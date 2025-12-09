/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabilita la generazione statica per pagine che usano hook client-side
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Ignora errori ESLint durante il build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora errori TypeScript durante il build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurazione immagini
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig

