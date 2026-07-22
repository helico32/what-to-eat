import { useState, useEffect } from 'react'

// Renvoie true si la fenêtre fait au moins 1024px de large.
// Se met à jour automatiquement si la fenêtre est redimensionnée.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}
