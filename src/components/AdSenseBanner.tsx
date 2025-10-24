'use client'

import { useEffect, useState } from 'react'

interface AdSenseBannerProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adStyle?: React.CSSProperties
  className?: string
  responsive?: boolean
  adsenseId?: string
}

export default function AdSenseBanner({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block', width: '100%', height: '250px' },
  className = '',
  responsive = true,
  adsenseId
}: AdSenseBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only load if we have an AdSense ID
    if (!adsenseId) return

    // Load AdSense script if not already loaded
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`
      script.crossOrigin = 'anonymous'
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [adsenseId])

  useEffect(() => {
    // Initialize AdSense when loaded
    if (isLoaded && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [isLoaded])

  // Don't render if no AdSense ID
  if (!adsenseId) {
    return null
  }

  return (
    <div className={`adsense-banner ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

// Declare global types for AdSense
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
