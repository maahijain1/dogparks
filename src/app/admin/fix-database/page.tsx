'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FixDatabasePage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const runDatabaseFix = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || 'Failed to fix database' })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
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
              <AlertCircle className="w-8 h-8 text-orange-500" />
              Fix Database Schema
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              This will add the missing city_id and template_id columns to the articles table and create the article_templates table.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">What this fixes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Adds city_id column to articles table</li>
                  <li>• Adds template_id column to articles table</li>
                  <li>• Creates article_templates table</li>
                  <li>• Adds proper indexes and RLS policies</li>
                </ul>
              </div>

              {result && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  result.success 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={runDatabaseFix} 
                disabled={isRunning}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fixing Database...
                  </>
                ) : (
                  'Fix Database Schema'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
