'use client'

import { useState } from 'react'
import Link from "next/link";
import { ArrowLeft, Database, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupTemplatesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string } | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/setup-templates', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? 'Migration completed successfully!' : 'Migration failed'),
        details: data.details
      })
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Error running migration: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Link 
              href="/admin" 
              className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Setup Article Templates</h1>
              <p className="text-gray-600 mt-1">
                Create the database tables needed for the template system
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What This Setup Does</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Creates the <code className="bg-gray-100 px-1 rounded">article_templates</code> table
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Adds <code className="bg-gray-100 px-1 rounded">template_id</code> and <code className="bg-gray-100 px-1 rounded">city_id</code> columns to articles table
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Sets up proper indexes for better performance
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Configures Row Level Security (RLS) policies
            </li>
          </ul>
        </div>

        {/* Migration Button */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Database Migration</h3>
              <p className="text-gray-600">
                Run the SQL migration to create the necessary tables and columns for the template system.
              </p>
            </div>
            <button
              onClick={runMigration}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Migration...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Migration
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className="font-semibold">
                {result.success ? 'Success!' : 'Error'}
              </span>
            </div>
            <p className="mb-2">{result.message}</p>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {result.details}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Next Steps */}
        {result?.success && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
            <ol className="space-y-2 text-blue-800">
              <li>1. Go to <Link href="/admin/templates" className="underline font-medium">Article Templates</Link> to create your first template</li>
              <li>2. Use template variables like <code className="bg-blue-100 px-1 rounded">{{CITY_NAME}}</code> in your content</li>
              <li>3. Generate city-specific articles for all cities at once</li>
              <li>4. Your articles will be automatically indexed and SEO-optimized</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
