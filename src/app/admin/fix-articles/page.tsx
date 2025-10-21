'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, CheckCircle, AlertCircle, Loader2, Play, FileText } from 'lucide-react'

export default function FixArticlesPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkArticlesStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/debug-articles-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const generateArticles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/generate-all-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      setStatus({ ...status, generationResult: data })
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
              <FileText className="w-8 h-8 text-blue-500" />
              Fix Articles Issue
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Check articles status and generate articles for all cities to fix the display issue.
            </p>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Check Status</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Check if articles table exists, has the city_id column, and see current article count.
              </p>
              <button
                onClick={checkArticlesStatus}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Check Articles Status
                  </>
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate Articles</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Generate articles for all cities. This will create unique articles for each city.
              </p>
              <button
                onClick={generateArticles}
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Articles
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

          {/* Status Display */}
          {status && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Articles Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Articles Table:</span>
                    {status.hasArticlesTable ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={status.hasArticlesTable ? 'text-green-600' : 'text-red-600'}>
                      {status.hasArticlesTable ? 'Exists' : 'Missing'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">City ID Column:</span>
                    {status.hasCityIdColumn ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={status.hasCityIdColumn ? 'text-green-600' : 'text-red-600'}>
                      {status.hasCityIdColumn ? 'Exists' : 'Missing'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total Articles:</span>
                    <span className="text-gray-600">{String(status.totalArticles || 0)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Articles with City ID:</span>
                    <span className="text-gray-600">{String(status.articlesWithCityId || 0)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total Cities:</span>
                    <span className="text-gray-600">{String(status.totalCities || 0)}</span>
                  </div>
                </div>

                {/* Sample Data */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Sample Articles:</h3>
                  {Array.isArray(status.sampleArticles) && status.sampleArticles.length > 0 ? (
                    <div className="space-y-2">
                      {status.sampleArticles.map((article: Record<string, unknown>, index: number) => (
                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <div className="font-medium">{String(article.title)}</div>
                          <div className="text-gray-500">Slug: {String(article.slug)}</div>
                          <div className="text-gray-500">City ID: {String(article.city_id || 'None')}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No articles found</p>
                  )}

                  <h3 className="font-medium text-gray-900 dark:text-white">Sample Cities:</h3>
                  {Array.isArray(status.sampleCities) && status.sampleCities.length > 0 ? (
                    <div className="space-y-2">
                      {status.sampleCities.map((city: Record<string, unknown>, index: number) => (
                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <div className="font-medium">{String(city.name)}</div>
                          <div className="text-gray-500">ID: {String(city.id)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No cities found</p>
                  )}
                </div>
              </div>

              {(() => {
                const result = status.generationResult as Record<string, unknown> | null;
                return result && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Generation Result:</h3>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p>Success: {String(result.success)}</p>
                      <p>Count: {String(result.count || 0)}</p>
                      {Boolean(result.message) && (
                        <p>Message: {String(result.message)}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Recommendations */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Recommendations:</h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {!status.hasCityIdColumn && (
                    <li>• Add city_id column to articles table using the Fix Database tool</li>
                  )}
                  {Number(status.totalArticles) === 0 && (
                    <li>• Generate articles for all cities using the Generate Articles button</li>
                  )}
                  {Number(status.totalCities) === 0 && (
                    <li>• Add cities first before generating articles</li>
                  )}
                  {Number(status.articlesWithCityId) === 0 && Number(status.totalArticles) > 0 && (
                    <li>• Existing articles are not linked to cities - regenerate them</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
