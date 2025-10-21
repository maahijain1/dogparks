'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, CheckCircle, AlertCircle, Loader2, Play, Star, FileText, Building2 } from 'lucide-react'

interface Results {
  articles?: {
    success: boolean
    data?: Record<string, unknown>
    message: string
  }
  featured?: {
    success: boolean
    data?: Record<string, unknown>
    message: string
  }
  database?: {
    totalListings: number
    totalCities: number
    totalStates: number
    featuredListings: number
  }
  tests?: {
    [key: string]: {
      success: boolean
      count: number
      message: string
    }
  }
}

export default function FixAllIssuesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runComprehensiveFix = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('🚀 Starting comprehensive fix...')

      // Step 1: Generate articles for all cities
      console.log('📝 Step 1: Generating articles for all cities...')
      const articlesResponse = await fetch('/api/admin/generate-all-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const articlesData = await articlesResponse.json()

      // Step 2: Auto-select featured listings for all cities
      console.log('⭐ Step 2: Auto-selecting featured listings...')
      const featuredResponse = await fetch('/api/listings/auto-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select' })
      })
      const featuredData = await featuredResponse.json()

      // Step 3: Check database status
      console.log('🔍 Step 3: Checking database status...')
      const debugResponse = await fetch('/api/listings')
      const debugData = await debugResponse.json()

      const citiesResponse = await fetch('/api/cities')
      const citiesData = await citiesResponse.json()

      const statesResponse = await fetch('/api/states')
      const statesData = await statesResponse.json()

      setResults({
        articles: {
          success: articlesResponse.ok,
          data: articlesData,
          message: articlesResponse.ok ? 'Articles generated successfully' : 'Failed to generate articles'
        },
        featured: {
          success: featuredResponse.ok,
          data: featuredData,
          message: featuredResponse.ok ? 'Featured listings updated successfully' : 'Failed to update featured listings'
        },
        database: {
          totalListings: Array.isArray(debugData) ? debugData.length : 0,
          totalCities: Array.isArray(citiesData) ? citiesData.length : 0,
          totalStates: Array.isArray(statesData) ? statesData.length : 0,
          featuredListings: Array.isArray(debugData) ? debugData.filter((l: Record<string, unknown>) => l.featured).length : 0
        }
      })

      console.log('✅ Comprehensive fix completed!')
    } catch (error) {
      console.error('❌ Error during comprehensive fix:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const runIndividualTests = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test listings API
      const listingsResponse = await fetch('/api/listings')
      const listingsData = await listingsResponse.json()

      // Test cities API
      const citiesResponse = await fetch('/api/cities')
      const citiesData = await citiesResponse.json()

      // Test states API
      const statesResponse = await fetch('/api/states')
      const statesData = await statesResponse.json()

      // Test featured listings
      const featuredResponse = await fetch('/api/listings?featured=true')
      const featuredData = await featuredResponse.json()

      setResults({
        tests: {
          listings: {
            success: listingsResponse.ok,
            count: Array.isArray(listingsData) ? listingsData.length : 0,
            message: listingsResponse.ok ? 'Listings API working' : 'Listings API failed'
          },
          cities: {
            success: citiesResponse.ok,
            count: Array.isArray(citiesData) ? citiesData.length : 0,
            message: citiesResponse.ok ? 'Cities API working' : 'Cities API failed'
          },
          states: {
            success: statesResponse.ok,
            count: Array.isArray(statesData) ? statesData.length : 0,
            message: statesResponse.ok ? 'States API working' : 'States API failed'
          },
          featured: {
            success: featuredResponse.ok,
            count: Array.isArray(featuredData) ? featuredData.length : 0,
            message: featuredResponse.ok ? 'Featured listings API working' : 'Featured listings API failed'
          }
        }
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
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
              Fix All Issues
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive solution to fix articles, featured listings, and database issues.
            </p>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Comprehensive Fix */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comprehensive Fix</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This will generate articles for all cities and auto-select featured listings.
              </p>
              <button
                onClick={runComprehensiveFix}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Fix...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Comprehensive Fix
                  </>
                )}
              </button>
            </div>

            {/* Individual Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test APIs</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Test all APIs to check current status without making changes.
              </p>
              <button
                onClick={runIndividualTests}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test All APIs
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Results</h2>
              
              {/* Articles Results */}
              {results.articles && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Articles Generation</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${results.articles.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {results.articles.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={results.articles.success ? 'text-green-800' : 'text-red-800'}>
                        {results.articles.message}
                      </span>
                    </div>
                    {results.articles.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Articles data available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Featured Listings Results */}
              {results.featured && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Featured Listings</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${results.featured.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {results.featured.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={results.featured.success ? 'text-green-800' : 'text-red-800'}>
                        {results.featured.message}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Status */}
              {results.database && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Database Status</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.database.totalListings}</div>
                      <div className="text-sm text-gray-600">Total Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.database.totalCities}</div>
                      <div className="text-sm text-gray-600">Cities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{results.database.totalStates}</div>
                      <div className="text-sm text-gray-600">States</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{results.database.featuredListings}</div>
                      <div className="text-sm text-gray-600">Featured</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results */}
              {results.tests && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Test Results</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(results.tests).map(([key, test]: [string, { success: boolean; count: number; message: string }]) => (
                      <div key={key} className={`p-3 rounded-lg ${test.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          {test.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-medium capitalize">{key}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                        <p className="text-sm text-gray-500">Count: {test.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/listings/businesses" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Manage Listings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">View and edit business listings</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/templates" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Article Templates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Manage article templates</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/debug-listings" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Debug Listings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Troubleshoot listing issues</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
