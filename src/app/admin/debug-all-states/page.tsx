'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function DebugAllStatesPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const debugAllStates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-all-states')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
      setResults({ error: 'Failed to debug all states' })
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
              <Database className="w-8 h-8 text-blue-500" />
              Debug All States
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Check articles and featured listings across all states to identify issues.
            </p>
          </div>

          {/* Debug Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button
              onClick={debugAllStates}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing All States...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Debug All States
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{String((results.summary as Record<string, unknown>)?.totalStates || 0)}</div>
                    <div className="text-sm text-gray-600">States</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{String((results.summary as Record<string, unknown>)?.totalCities || 0)}</div>
                    <div className="text-sm text-gray-600">Cities</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{String((results.summary as Record<string, unknown>)?.totalArticles || 0)}</div>
                    <div className="text-sm text-gray-600">Articles</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{String((results.summary as Record<string, unknown>)?.totalListings || 0)}</div>
                    <div className="text-sm text-gray-600">Listings</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{String((results.summary as Record<string, unknown>)?.totalFeatured || 0)}</div>
                    <div className="text-sm text-gray-600">Featured</div>
                  </div>
                </div>
              </div>

              {/* Issues */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Issues Found</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">No Articles</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{String((results.issues as Record<string, unknown>)?.statesWithNoArticles || 0)}</div>
                    <div className="text-sm text-red-600">States</div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800 dark:text-orange-200">No Featured</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{String((results.issues as Record<string, unknown>)?.statesWithNoFeatured || 0)}</div>
                    <div className="text-sm text-orange-600">States</div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Few Articles</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{String((results.issues as Record<string, unknown>)?.statesWithFewArticles || 0)}</div>
                    <div className="text-sm text-yellow-600">States</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">Few Featured</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{String((results.issues as Record<string, unknown>)?.statesWithFewFeatured || 0)}</div>
                    <div className="text-sm text-blue-600">States</div>
                  </div>
                </div>
              </div>

              {/* State Details */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">State Analysis</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2">State</th>
                        <th className="text-center py-2">Cities</th>
                        <th className="text-center py-2">Articles</th>
                        <th className="text-center py-2">Listings</th>
                        <th className="text-center py-2">Featured</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results.stateAnalysis as Record<string, unknown>[])?.map((state: Record<string, unknown>, index: number) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 font-medium">{String(state.state)}</td>
                          <td className="py-2 text-center">{String(state.citiesCount)}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              Number(state.articlesCount) === 0 ? 'bg-red-100 text-red-800' :
                              Number(state.articlesCount) < 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {String(state.articlesCount)}
                            </span>
                          </td>
                          <td className="py-2 text-center">{String(state.listingsCount)}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              Number(state.featuredCount) === 0 ? 'bg-red-100 text-red-800' :
                              Number(state.featuredCount) < 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {String(state.featuredCount)}
                            </span>
                          </td>
                          <td className="py-2 text-center">
                            {Number(state.articlesCount) > 0 && Number(state.featuredCount) >= 3 ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
