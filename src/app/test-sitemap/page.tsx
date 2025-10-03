'use client'

import { useState, useEffect } from 'react'

export default function TestSitemapPage() {
  const [sitemapData, setSitemapData] = useState<{
    success: boolean
    baseUrl: string
    niche: string
    nicheSlug: string
    statesCount: number
    citiesCount: number
    articlesCount: number
    sampleStates: string[]
    sampleCities: string[]
    sampleArticles: string[]
    sampleUrls: string[]
    errors: {
      articlesError?: string
      statesError?: string
      citiesError?: string
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('/api/sitemap-test')
        const data = await response.json()
        setSitemapData(data)
      } catch (error) {
        console.error('Error fetching sitemap data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSitemap()
  }, [])

  if (loading) return <div>Loading sitemap data...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sitemap Debug</h1>
        
        {sitemapData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">States Count: {sitemapData.statesCount}</h2>
              <p>Sample states: {sitemapData.sampleStates?.join(', ')}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Cities Count: {sitemapData.citiesCount}</h2>
              <p>Sample cities: {sitemapData.sampleCities?.join(', ')}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Articles Count: {sitemapData.articlesCount}</h2>
              <p>Sample articles: {sitemapData.sampleArticles?.join(', ')}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Niche: {sitemapData.niche}</h2>
              <p>Niche Slug: {sitemapData.nicheSlug}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Sample URLs:</h2>
              <div className="space-y-1">
                {sitemapData.sampleUrls?.map((url: string, index: number) => (
                  <div key={index} className="text-sm text-blue-600">{url}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
