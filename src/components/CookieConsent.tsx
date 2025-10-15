'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent')
      if (!consent) setVisible(true)
    } catch {
      // ignore
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem('cookie_consent', 'accepted')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const decline = () => {
    try {
      localStorage.setItem('cookie_consent', 'declined')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60]">
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-lg bg-gray-900 text-white shadow-lg p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm leading-6">
            We use cookies to improve your experience. See our{' '}
            <Link href="/privacy" className="underline hover:text-blue-300">Privacy Policy</Link>{' '}and{' '}
            <Link href="/cookie-policy" className="underline hover:text-blue-300">Cookie Policy</Link>.
          </p>
          <div className="flex gap-2">
            <button onClick={decline} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Decline</button>
            <button onClick={accept} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm">Accept</button>
          </div>
        </div>
      </div>
    </div>
  )
}


