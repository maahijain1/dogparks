'use client'

import { useState } from 'react'
import { ArrowLeft, Database, AlertCircle, CheckCircle, Search } from 'lucide-react'
import Link from 'next/link'

export default function DebugListingsPage() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const runDebug = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test 1: Check total listings count
      const listingsResponse = await fetch('/api/listings')
      const listingsData = await listingsResponse.json()
      
      // Test 2: Check cities count
      const citiesResponse = await fetch('/api/cities')
      const citiesData = await citiesResponse.json()
      
      // Test 3: Check states count
      const statesResponse = await fetch('/api/states')
      const statesData = await statesResponse.json()
      
      // Test 4: Check featured listings
      const featuredResponse = await fetch('/api/listings?featured=true')
      const featuredData = await featuredResponse.json()
      
      // Test 5: Check if listings have city relationships
      const listingsWithCities = Array.isArray(listingsData) ? 
        listingsData.filter((listing: Record<string, unknown>) => listing.cities) : []
      
      // Test 6: Check for listings without cities
      const listingsWithoutCities = Array.isArray(listingsData) ? 
        listingsData.filter((listing: Record<string, unknown>) => !listing.cities) : []

      setDebugInfo({
        totalListings: Array.isArray(listingsData) ? listingsData.length : 'Error',
        totalCities: Array.isArray(citiesData) ? citiesData.length : 'Error',
        totalStates: Array.isArray(statesData) ? statesData.length : 'Error',
        featuredListings: Array.isArray(featuredData) ? featuredData.length : 'Error',
        listingsWithCities: listingsWithCities.length,
        listingsWithoutCities: listingsWithoutCities.length,
        listingsData: listingsData,
        citiesData: citiesData,
        statesData: statesData,
        featuredData: featuredData
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const searchCities = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cities?search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      setDebugInfo(prev => ({
        ...prev,
        searchResults: data,
        searchTerm: searchTerm
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/admin" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-500" />
              Debug Listings & Cities
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Troubleshoot why listings aren&apos;t showing and test city search functionality.
            </p>
          </div>

          {/* Debug Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button 
              onClick={runDebug} 
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Debug...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Listings Debug
                </>
              )}
            </button>
          </div>

          {/* City Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-green-600" />
              Test City Search
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a city (e.g., 'New York', 'Los Angeles')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchCities}
                disabled={loading || !searchTerm.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results */}
          {debugInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Debug Results
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Listings Data</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total Listings: <span className="font-medium">{String(debugInfo.totalListings)}</span></div>
                    <div>Featured Listings: <span className="font-medium">{String(debugInfo.featuredListings)}</span></div>
                    <div>With Cities: <span className="font-medium">{String(debugInfo.listingsWithCities)}</span></div>
                    <div>Without Cities: <span className="font-medium">{String(debugInfo.listingsWithoutCities)}</span></div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Cities & States</h4>
                  <div className="space-y-1 text-sm">
                    <div>Total Cities: <span className="font-medium">{String(debugInfo.totalCities)}</span></div>
                    <div>Total States: <span className="font-medium">{String(debugInfo.totalStates)}</span></div>
                  </div>
                </div>
              </div>

              {Array.isArray(debugInfo.searchResults) && debugInfo.searchResults.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Search Results for &quot;{String(debugInfo.searchTerm)}&quot;:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {debugInfo.searchResults.map((city: Record<string, unknown>, index: number) => (
                        <li key={index} className="text-sm">
                          <strong>{String(city.name)}</strong> - {String((city.states as Record<string, unknown>)?.name) || 'No State'} (ID: {String(city.id)})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Issues Detection */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Potential Issues:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {Number(debugInfo.totalListings) === 0 && (
                    <li>⚠️ No listings found - check if listings exist in database</li>
                  )}
                  {Number(debugInfo.listingsWithoutCities) > 0 && (
                    <li>⚠️ {String(debugInfo.listingsWithoutCities)} listings missing city relationships</li>
                  )}
                  {Number(debugInfo.totalCities) === 0 && (
                    <li>⚠️ No cities found - check if cities exist in database</li>
                  )}
                  {Number(debugInfo.featuredListings) === 0 && (
                    <li>⚠️ No featured listings found</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
