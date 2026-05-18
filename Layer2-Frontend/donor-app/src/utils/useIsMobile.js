import { useEffect, useState } from 'react'

/**
 * Returns true when the viewport is at or below the given breakpoint (default 768px).
 * Subscribes to window resize / orientation changes via matchMedia.
 */
export function useIsMobile(maxWidth = 768) {
  const query = `(max-width: ${maxWidth}px)`
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return isMobile
}
