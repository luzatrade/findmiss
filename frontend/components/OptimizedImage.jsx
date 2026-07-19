'use client'

import { buildMediaSrcSet, pickMediaUrl } from '../lib/media'
import { getApiOrigin, toAbsoluteMediaUrl } from '../lib/runtime-api'

export default function OptimizedImage({
  media,
  src,
  alt = '',
  variant = 'thumb',
  sizes,
  priority = false,
  className = '',
  ...props
}) {
  const apiOrigin = getApiOrigin()
  const resolvedSrc = src
    ? toAbsoluteMediaUrl(src, apiOrigin)
    : pickMediaUrl(media, variant, apiOrigin)

  if (!resolvedSrc) return null

  const srcSet = media ? buildMediaSrcSet(media, apiOrigin) : undefined

  return (
    <img
      src={resolvedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      {...props}
    />
  )
}
