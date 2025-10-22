'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wrench, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function FixEverythingPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const runFix = async () => {
    if (!confirm('This will regenerate articles and fix featured listings for ALL cities. Continue?')) {
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/fix-everything', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
      setResults({ 
        success: false, 
        error: 'Failed to run fix', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
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
              <Wrench className="w-8 h-8 text-blue-500" />
              Fix Everything
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive fix for articles and featured listings across all cities.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">What This Does:</h3>
                <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1 text-sm">
                  <li>Sets ALL city articles to published status</li>
                  <li>Generates articles for any cities missing articles</li>
                  <li>Ensures each city has at least 3 featured listings (if available)</li>
                  <li>Uses full HTML template for article content</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fix Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button
              onClick={runFix}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Running Comprehensive Fix...
                </>
              ) : (
                <>
                  <Wrench className="w-5 h-5 mr-2" />
                  Run Comprehensive Fix
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {Boolean(results) && results && (
            <div className="space-y-6">
              {/* Success/Error Message */}
              <div className={`rounded-xl p-6 ${
                Boolean(results.success)
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  {Boolean(results.success) ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      Boolean(results.success)
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {Boolean(results.success) ? 'Fix Completed Successfully!' : 'Fix Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      Boolean(results.success)
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {String(results.message || results.error || 'Unknown result')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              {Boolean(results.results) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Articles */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Articles Created</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {String(((results.results as Record<string, unknown>).articles as Record<string, unknown>)?.count || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {String((((results.results as Record<string, unknown>).articles as Record<string, unknown>)?.errors as string[])?.length || 0)} errors
                    </div>
                  </div>

                  {/* Published */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Articles Published</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {String(((results.results as Record<string, unknown>).published as Record<string, unknown>)?.count || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {String((((results.results as Record<string, unknown>).published as Record<string, unknown>)?.errors as string[])?.length || 0)} errors
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Featured Updated</h3>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {String(((results.results as Record<string, unknown>).featured as Record<string, unknown>)?.count || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {String((((results.results as Record<string, unknown>).featured as Record<string, unknown>)?.errors as string[])?.length || 0)} errors
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Next Steps:</h3>
                <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-2 text-sm">
                  <li>Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
                  <li>Visit any city page to verify articles are showing</li>
                  <li>Check that featured listings are displaying</li>
                  <li>Verify article content is showing in full length</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
