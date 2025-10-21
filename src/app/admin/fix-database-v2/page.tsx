'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Database, Copy } from 'lucide-react'
import Link from 'next/link'

export default function FixDatabaseV2Page() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string[]; results?: string[]; instructions?: string } | null>(null)

  const runDatabaseCheck = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/fix-database-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
    } finally {
      setIsRunning(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('SQL copied to clipboard!')
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
              Database Schema Checker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              This tool will check your database schema and provide exact SQL commands to fix any issues.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button 
              onClick={runDatabaseCheck} 
              disabled={isRunning}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Check Database Schema
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {result.success ? 'Database Check Complete' : 'Manual Action Required'}
                </h3>
              </div>

              <div className="mb-4">
                <p className={`text-lg ${result.success ? 'text-green-800' : 'text-orange-800'}`}>
                  {result.message}
                </p>
              </div>

              {result.results && result.results.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Check Results:</h4>
                  <ul className="space-y-1">
                    {result.results.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.details && result.details.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">SQL Commands to Run:</h4>
                  <div className="bg-gray-100 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyToClipboard(result.details!.join('\n'))}
                      className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Copy SQL to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {result.details.join('\n')}
                    </pre>
                  </div>
                </div>
              )}

              {result.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                  <p className="text-blue-700">{result.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-yellow-800 mb-2">How to Fix Database Issues:</h3>
            <ol className="text-sm text-yellow-700 space-y-2">
              <li>1. Click "Check Database Schema" above</li>
              <li>2. If SQL commands are provided, copy them</li>
              <li>3. Go to your Supabase dashboard → SQL Editor</li>
              <li>4. Paste and run the SQL commands</li>
              <li>5. Come back and test template creation</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
