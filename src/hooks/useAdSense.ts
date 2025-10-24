import { useState, useEffect } from 'react'

export function useAdSense() {
  const [adsenseId, setAdsenseId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdSenseId = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setAdsenseId(data.adsense_id || '')
        }
      } catch (error) {
        console.error('Error fetching AdSense ID:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdSenseId()
  }, [])

  return { adsenseId, loading }
}
