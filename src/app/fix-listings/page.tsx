'use client'

import { useState } from 'react'

export default function FixListingsPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fixCityListings = async () => {
    setLoading(true)
    setStatus('🔧 FIXING CITY-LISTING LINKS...\n\n')

    try {
      const response = await fetch('/api/fix-city-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()

      if (response.ok) {
        setStatus(prev => prev + `✅ SUCCESS!\n`)
        setStatus(prev => prev + `Fixed ${result.results.fixedCount} listings\n`)
        setStatus(prev => prev + `Total cities: ${result.results.totalCities}\n`)
        setStatus(prev => prev + `Total listings: ${result.results.totalListings}\n\n`)
        
        setStatus(prev => prev + `Listings per city:\n`)
        result.results.cityCounts.forEach((city: { city: string; count: number }) => {
          setStatus(prev => prev + `- ${city.city}: ${city.count} listings\n`)
        })

        if (result.results.errors.length > 0) {
          setStatus(prev => prev + `\nErrors:\n`)
          result.results.errors.forEach((error: string) => {
            setStatus(prev => prev + `- ${error}\n`)
          })
        }

        setStatus(prev => prev + `\n🎉 DONE! Now check your city pages.\n`)
        setStatus(prev => prev + `Try: https://dogparks.vercel.app/city/newcastle\n`)

      } else {
        setStatus(prev => prev + `❌ ERROR: ${result.error}\n`)
        setStatus(prev => prev + `Details: ${result.details}\n`)
      }
    } catch (error) {
      setStatus(prev => prev + `❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Fix City-Listing Links</h1>

        <div className="bg-red-50 border border-red-300 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">⚠️ This Will Fix Your Listings</h2>
          <p className="text-red-700 mb-4">
            This tool will properly link your uploaded listings to the correct cities. 
            It will match listings to cities by name and update the city_id in the database.
          </p>
          <button
            onClick={fixCityListings}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Fixing...' : 'Fix City-Listing Links NOW'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-300 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">What This Does</h2>
          <ul className="text-blue-700 space-y-2">
            <li>• Gets all cities from your database</li>
            <li>• Gets all listings from your database</li>
            <li>• Matches listings to cities by name</li>
            <li>• Updates the city_id for each listing</li>
            <li>• Shows you how many listings each city has</li>
          </ul>
        </div>

        {status && (
          <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mt-6">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
