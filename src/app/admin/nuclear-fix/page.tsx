'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function NuclearFixPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const runFix = async () => {
    if (!confirm('⚠️ This will regenerate ALL articles and fix ALL featured listings. This may take 1-2 minutes. Continue?')) {
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/nuclear-fix', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error:', error)
      setResults({ 
        success: false, 
        error: 'Failed to run nuclear fix', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
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
              <Zap className="w-8 h-8 text-purple-500" />
              Nuclear Fix - Direct Database Fix
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              This will directly fix ALL cities articles and featured listings. No intermediaries, direct database access.
            </p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3 text-lg">⚡ What This Does:</h3>
            <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-2">
              <li>Generates/updates articles for <strong>EVERY SINGLE CITY</strong> in your database</li>
              <li>Uses full HTML template with complete content</li>
              <li>Sets <code>published = true</code> for all city articles</li>
              <li>Ensures every city has exactly <strong>3 featured listings</strong> (or all available if less than 3)</li>
              <li>Processes everything in ONE GO - no manual steps</li>
            </ul>
            <p className="mt-4 font-medium text-yellow-900 dark:text-yellow-100">
              ⏱️ This may take 1-2 minutes depending on how many cities you have.
            </p>
          </div>

          {/* Fix Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button
              onClick={runFix}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Running Nuclear Fix... Please Wait...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  RUN NUCLEAR FIX NOW
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {Boolean(results) && results && (
            <div className="space-y-6">
              {/* Success/Error Message */}
              <div className={`rounded-xl p-6 border-2 ${
                Boolean(results.success)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
              }`}>
                <div className="flex items-center gap-3">
                  {Boolean(results.success) ? (
                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${
                      Boolean(results.success)
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {Boolean(results.success) ? '✅ Nuclear Fix Complete!' : '❌ Nuclear Fix Failed'}
                    </h3>
                    <p className={`mt-1 ${
                      Boolean(results.success)
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {String(results.message || results.error || 'Unknown result')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              {Boolean(results.results) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Articles Generated</h4>
                    <div className="text-4xl font-bold text-blue-600">
                      {String((results.results as Record<string, unknown>).articlesGenerated || 0)}
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Articles Updated</h4>
                    <div className="text-4xl font-bold text-green-600">
                      {String((results.results as Record<string, unknown>).articlesUpdated || 0)}
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Featured Fixed</h4>
                    <div className="text-4xl font-bold text-yellow-600">
                      {String((results.results as Record<string, unknown>).featuredFixed || 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {Boolean(results.results) && Boolean((results.results as Record<string, unknown>).errors) && ((results.results as Record<string, unknown>).errors as string[]).length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-3">
                    Errors ({((results.results as Record<string, unknown>).errors as string[]).length}):
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {((results.results as Record<string, unknown>).errors as string[]).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-3 text-lg">✅ Next Steps:</h3>
                <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-2">
                  <li><strong>Clear your browser cache</strong> (Ctrl+Shift+R or Cmd+Shift+R)</li>
                  <li><strong>Visit any city page</strong> to verify articles are showing</li>
                  <li><strong>Check featured listings</strong> on city pages</li>
                  <li><strong>Verify all content</strong> is displaying correctly</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
