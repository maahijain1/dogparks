'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Google Analytics 4 tracking component with admin exclusion and owner visit exclusion

interface GoogleAnalyticsProps {
  measurementId: string
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const [shouldTrack, setShouldTrack] = useState(false)

  useEffect(() => {
    // Check if this is the website owner (you can customize this logic)
    const isOwner = () => {
      // Method 1: Check for specific user agent patterns (customize as needed)
      const userAgent = navigator.userAgent.toLowerCase()
      const ownerPatterns = [
        'your-specific-browser-signature', // Add your browser's unique signature
        'chrome/120.0.0.0', // Example: specific Chrome version you use
        // Add more patterns as needed
      ]
      
      // Method 2: Check for specific cookies or localStorage values
      const ownerCookie = document.cookie.includes('owner_visit=true')
      const ownerStorage = localStorage.getItem('owner_visit') === 'true'
      
      // Method 3: Check for specific referrer patterns
      const referrer = document.referrer
      const ownerReferrers = [
        'localhost',
        '127.0.0.1',
        // Add your development domains
      ]
      
      return ownerPatterns.some(pattern => userAgent.includes(pattern)) ||
             ownerCookie || ownerStorage ||
             ownerReferrers.some(ref => referrer.includes(ref))
    }

    // Don't track admin pages or owner visits
    if (pathname?.startsWith('/admin') || isOwner()) {
      setShouldTrack(false)
      return
    }

    setShouldTrack(true)

    // Initialize gtag if not already done
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [pathname, measurementId])

  // Don't load Google Analytics on admin pages or for owner visits
  if (pathname?.startsWith('/admin') || !shouldTrack) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}
