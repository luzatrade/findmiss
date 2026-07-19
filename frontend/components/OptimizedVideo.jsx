'use client'

import { forwardRef } from 'react'
import { pickMediaUrl } from '../lib/media'
import { getApiOrigin, toAbsoluteMediaUrl } from '../lib/runtime-api'

const OptimizedVideo = forwardRef(function OptimizedVideo(
  {
    media,
    src,
    poster,
    className = '',
    autoPlay = false,
    muted = true,
    loop = false,
    controls = false,
    playsInline = true,
    preload = 'metadata',
    ...props
  },
  ref
) {
  const apiOrigin = getApiOrigin()
  const resolvedSrc = src
    ? toAbsoluteMediaUrl(src, apiOrigin)
    : pickMediaUrl(media, 'full', apiOrigin)

  const resolvedPoster = poster
    ? toAbsoluteMediaUrl(poster, apiOrigin)
    : media?.thumbnail_url
      ? pickMediaUrl(media, 'thumb', apiOrigin)
      : undefined

  if (!resolvedSrc) return null

  return (
    <video
      ref={ref}
      src={resolvedSrc}
      poster={resolvedPoster}
      className={className}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      preload={preload}
      {...props}
    />
  )
})

export default OptimizedVideo
