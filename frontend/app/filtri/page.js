import { Suspense } from 'react'
import { filtriMetadataFromSearchParams } from '../../lib/seo'
import FiltriPageClient from './FiltriPageClient'

export function generateMetadata({ searchParams }) {
  return filtriMetadataFromSearchParams(searchParams || {})
}

export default function FiltriPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      }
    >
      <FiltriPageClient />
    </Suspense>
  )
}