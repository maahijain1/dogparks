'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, AlertCircle, Loader2, Play, FileText, Star, Settings } from 'lucide-react'

interface Results {
  articles?: {
    success: boolean
    count: number
    message: string
  }
  featured?: {
    success: boolean
    totalUpdated: number
    results: Array<{
      city: string
      state: string
      listings: number
      featured: number
      message: string
    }>
  }
  database?: {
    success: boolean
    message: string
  }
}

export default function FixAllIssuesV2Page() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Results>({})
  const [error, setError] = useState<string | null>(null)

  const fixAllIssues = async () => {
    setLoading(true)
    setError(null)
    setResults({})

    try {
      // Step 1: Fix database schema
      console.log('Step 1: Fixing database schema...')
      const dbResponse = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const dbResult = await dbResponse.json()
      setResults(prev => ({ ...prev, database: dbResult }))

      // Step 2: Generate articles for all cities
      console.log('Step 2: Generating articles...')
      const articlesResponse = await fetch('/api/admin/generate-beautiful-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const articlesResult = await articlesResponse.json()
      setResults(prev => ({ ...prev, articles: articlesResult }))

      // Step 3: Fix featured listings
      console.log('Step 3: Fixing featured listings...')
      const featuredResponse = await fetch('/api/admin/fix-featured-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const featuredResult = await featuredResponse.json()
      setResults(prev => ({ ...prev, featured: featuredResult }))

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fixDatabaseOnly = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await response.json()
      setResults(prev => ({ ...prev, database: result }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const generateArticlesOnly = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/generate-beautiful-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await response.json()
      setResults(prev => ({ ...prev, articles: result }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fixFeaturedOnly = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/fix-featured-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await response.json()
      setResults(prev => ({ ...prev, featured: result }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
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
              <Settings className="w-8 h-8 text-blue-500" />
              Fix All Issues (V2)
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive fix for articles, featured listings, and database issues.
            </p>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Fix All Issues */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fix All Issues</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Fix database, generate articles, and set featured listings for all cities.
              </p>
              <button
                onClick={fixAllIssues}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing All...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Fix All Issues
                  </>
                )}
              </button>
            </div>

            {/* Fix Database */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fix Database</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create article_templates table and add city_id column to articles.
              </p>
              <button
                onClick={fixDatabaseOnly}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Fix Database
                  </>
                )}
              </button>
            </div>

            {/* Generate Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Articles</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Generate beautiful articles for all cities using the template system.
              </p>
              <button
                onClick={generateArticlesOnly}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Articles
                  </>
                )}
              </button>
            </div>

            {/* Fix Featured Listings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fix Featured</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ensure all cities have exactly 3 featured listings.
              </p>
              <button
                onClick={fixFeaturedOnly}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Fix Featured
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
          {Object.keys(results).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Results</h2>
              
              <div className="space-y-6">
                {/* Database Results */}
                {results.database && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database Fix
                    </h3>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p>Success: {String(results.database.success)}</p>
                      <p>Message: {String(results.database.message)}</p>
                    </div>
                  </div>
                )}

                {/* Articles Results */}
                {results.articles && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Articles Generation
                    </h3>
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p>Success: {String(results.articles.success)}</p>
                      <p>Count: {String(results.articles.count || 0)}</p>
                      <p>Message: {String(results.articles.message)}</p>
                    </div>
                  </div>
                )}

                {/* Featured Results */}
                {results.featured && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Featured Listings Fix
                    </h3>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p>Success: {String(results.featured.success)}</p>
                      <p>Total Updated: {String(results.featured.totalUpdated || 0)}</p>
                      
                      {results.featured.results && results.featured.results.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">City Results:</p>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {results.featured.results.slice(0, 10).map((result, index) => (
                              <div key={index} className="text-xs bg-white dark:bg-gray-700 p-2 rounded">
                                <span className="font-medium">{result.city}</span> - 
                                {result.featured} featured out of {result.listings} listings
                                {result.message && ` (${result.message})`}
                              </div>
                            ))}
                            {results.featured.results.length > 10 && (
                              <p className="text-xs text-gray-500">... and {results.featured.results.length - 10} more cities</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
