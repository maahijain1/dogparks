'use client'

import { useState } from 'react'
import { ArrowLeft, Database, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DebugTemplatesPage() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDebug = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Test 1: Check if article_templates table exists
      const templatesResponse = await fetch('/api/admin/templates')
      const templatesData = await templatesResponse.json()
      
      // Test 2: Try to create a test template
      const testTemplate = {
        title: 'Test Template',
        content: '<p>This is a test template</p>',
        slug: `test-template-${Date.now()}`,
        description: 'Debug test template',
        is_active: true
      }

      const createResponse = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testTemplate)
      })

      const createData = await createResponse.json()

      // Test 3: Fetch templates again to see if it appears
      const templatesResponse2 = await fetch('/api/admin/templates')
      const templatesData2 = await templatesResponse2.json()

      setDebugInfo({
        templatesTableExists: templatesResponse.ok,
        templatesCount: Array.isArray(templatesData) ? templatesData.length : 'Error',
        createTemplateSuccess: createResponse.ok,
        createTemplateData: createData,
        templatesAfterCreate: Array.isArray(templatesData2) ? templatesData2.length : 'Error',
        templatesAfterCreateData: templatesData2
      })

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
              <Database className="w-8 h-8 text-blue-500" />
              Debug Templates System
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              This will test the templates system and help identify any issues.
            </p>
          </div>

          {/* Debug Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <button 
              onClick={runDebug} 
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Debug...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run Debug Test
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Debug Results */}
          {debugInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Debug Results</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {debugInfo.templatesTableExists ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">Templates Table Access:</span>
                  <span className={debugInfo.templatesTableExists ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.templatesTableExists ? 'Working' : 'Failed'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Initial Templates Count:</span>
                  <span className="text-gray-600">{String(debugInfo.templatesCount)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {debugInfo.createTemplateSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">Template Creation:</span>
                  <span className={debugInfo.createTemplateSuccess ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.createTemplateSuccess ? 'Success' : 'Failed'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Templates After Creation:</span>
                  <span className="text-gray-600">{String(debugInfo.templatesAfterCreate)}</span>
                </div>

                {!debugInfo.createTemplateSuccess && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Creation Error:</h4>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">
                      {JSON.stringify(debugInfo.createTemplateData, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Full Debug Data:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
