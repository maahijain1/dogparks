'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function DirectFixPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const runDirectFix = async () => {
    setLoading(true)
    setResults(null)
    try {
      const response = await fetch('/api/admin/direct-article-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error running direct fix:', error)
      setResults({ success: false, error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900 dark:to-orange-900 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Admin
        </Link>

        <h1 className="text-4xl font-extrabold text-red-800 dark:text-red-200 mb-6 text-center">
          ⚡ DIRECT ARTICLE FIX
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          <strong className="text-red-600 dark:text-red-400">SIMPLE & FAST!</strong>
          <br/>
          This tool directly generates clean, simple articles for ALL cities:
          <ul className="list-disc list-inside mt-4 text-left mx-auto max-w-md">
            <li>Gets city data directly from database</li>
            <li>Creates simple, clean article content</li>
            <li>NO complex template engine</li>
            <li>NO extra database queries</li>
            <li>Marks all articles as published</li>
          </ul>
        </p>

        <div className="text-center mb-8">
          <button
            onClick={runDirectFix}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg rounded-lg shadow-lg hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Running Direct Fix...' : 'Run Direct Fix NOW'}
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

            {/* Stats */}
            {Boolean(results.stats) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Total Cities</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {String(((results.stats as Record<string, unknown>).totalCities as number) || 0)}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Created</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {String(((results.stats as Record<string, unknown>).created as number) || 0)}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Updated</h3>
                  <div className="text-3xl font-bold text-yellow-600">
                    {String(((results.stats as Record<string, unknown>).updated as number) || 0)}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Errors</h3>
                  <div className="text-3xl font-bold text-red-600">
                    {String(((results.stats as Record<string, unknown>).errors as number) || 0)}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3">Next Steps</h3>
              <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)</li>
                <li>Visit any city page to verify articles now show correct city names</li>
                <li>Check that articles are displayed properly</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

