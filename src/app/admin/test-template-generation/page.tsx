'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  title: string
  content: string
  slug: string
  description: string
  is_active: boolean
}

export default function TestTemplateGenerationPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: Record<string, unknown> } | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/templates')
      const data = await response.json()
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateArticles = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first')
      return
    }

    setGenerating(true)
    setResult(null)

    try {
      const response = await fetch(`/api/admin/templates/${selectedTemplate}/generate-all-cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully generated articles! ${data.generated?.length || 0} articles created/updated.`,
          details: data
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to generate articles',
          details: data
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setGenerating(false)
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
              <Play className="w-8 h-8 text-green-500" />
              Test Template Generation
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Generate articles from your templates for all cities. This will create unique articles for each city using your template variables.
            </p>
          </div>

          {/* Template Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Template to Generate Articles
            </h3>
            
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800">No templates found. Create a template first.</p>
                <Link 
                  href="/admin/templates" 
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Go to Templates
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <label key={template.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplate === template.id}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{template.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Slug: {template.slug} | Active: {template.is_active ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Generate Button */}
          {templates.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <button
                onClick={generateArticles}
                disabled={!selectedTemplate || generating}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Articles...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Articles for All Cities
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {result.success ? 'Generation Complete!' : 'Generation Failed'}
                </h3>
              </div>

              <div className="mb-4">
                <p className={`text-lg ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
              </div>

              {result.details && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Details:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-blue-800 mb-2">How Template Generation Works:</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Select a template from the list above</li>
              <li>2. Click &quot;Generate Articles for All Cities&quot;</li>
              <li>3. The system will create unique articles for each city</li>
              <li>4. Template variables like &#123;&#123;CITY_NAME&#125;&#125; will be replaced with actual city data</li>
              <li>5. Articles will appear on city pages below the listings</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
