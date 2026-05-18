import React, { useState } from 'react'
import { resolveImageUrl } from '../utils/imageUrl'

/**
 * Image wrapper for food-listing cards.
 *
 * Behaviour:
 *   - While the image is fetching, shows a shimmering green-tinted skeleton
 *     (same shimmer language as OrgIntelligencePage / CoverageGapMap loading).
 *   - Once the image successfully loads, fades it in over the skeleton.
 *   - If `photoUrl` is missing OR the image errors out, falls back to a
 *     centred "image_not_supported" icon.
 *
 * The skeleton always sits absolutely behind the image, so the parent's
 * fixed height stays stable — no layout shift while images load in.
 */
export default function ListingImage({ photoUrl, alt = '', style = {}, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const showImage = Boolean(photoUrl) && !failed

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
      {/* Inject shimmer keyframes once at module level (cheap; React dedupes) */}
      <style>{`
        @keyframes listing-img-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      {/* Skeleton — shown until image loads or fails */}
      {showImage && !loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(149,212,179,0.06) 0%, rgba(149,212,179,0.16) 50%, rgba(149,212,179,0.06) 100%)',
            backgroundSize: '200% 100%',
            animation: 'listing-img-shimmer 1.6s ease-in-out infinite',
          }}
        />
      )}

      {/* Actual image — fades in when loaded */}
      {showImage && (
        <img
          src={resolveImageUrl(photoUrl)}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
          }}
        />
      )}

      {/* Fallback — no photo URL, or load failed */}
      {!showImage && (
        <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'rgba(149,212,179,0.3)' }}>image_not_supported</span>
        </div>
      )}
    </div>
  )
}
