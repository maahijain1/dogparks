'use client'

import { useEffect } from 'react'

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          try {
            registration.unregister()
          } catch {
            // ignore
          }
        })
      }).catch(() => {})
    }
    // Also clear any navigation preload to avoid stale responses
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        // @ts-expect-error - postMessage method exists but TypeScript doesn't recognize it
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_PRELOAD' })
      } catch {}
    }
  }, [])

  return null
}


