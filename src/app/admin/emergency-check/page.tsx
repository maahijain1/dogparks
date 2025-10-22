'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'

export default function EmergencyCheckPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, unknown> | null>(null)

  const runCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/emergency-check')
      const data = await response.json()
      setResults(data)
      console.log('Emergency check results:', data)
    } catch (error) {
      console.error('Error:', error)
      setResults({ error: 'Failed to run check' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          Emergency Database Check
        </h1>

        <button
          onClick={runCheck}
          disabled={loading}
          className="mb-6 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Run Emergency Check'
          )}
        </button>

        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
