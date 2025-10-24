'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

export default function DeleteAboutArticlesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    deleted: number;
    articles?: Array<{ slug: string; title: string }>;
    message: string;
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/delete-about-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to delete articles')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Admin
          </Link>
          
          <div className="flex items-center">
            <Trash2 className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delete About Articles</h1>
              <p className="text-gray-600 mt-1">Remove all programmatically generated about-* articles</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-900 mb-2">⚠️ Warning</h3>
              <div className="text-sm text-red-800 space-y-2">
                <p>This will permanently delete all articles with slugs starting with &quot;about-&quot;.</p>
                <p>These are typically programmatically generated articles like:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code>about-folsom-california</code></li>
                  <li><code>about-wilton-connecticut</code></li>
                  <li><code>about-{`{city}-{state}`}</code></li>
                </ul>
                <p className="font-medium">This action cannot be undone!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delete About Articles</h3>
          <p className="text-gray-600 mb-6">
            This will remove all programmatically generated about-* articles that are causing duplicate content issues.
          </p>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All About Articles
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900 mb-2">✅ Success!</h3>
                <p className="text-green-800">
                  Successfully deleted {result.deleted} about-* articles.
                </p>
                {result.articles && result.articles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-900 mb-2">Deleted articles:</p>
                    <ul className="text-sm text-green-800 space-y-1">
                      {result.articles.slice(0, 10).map((article: { slug: string; title: string }, index: number) => (
                        <li key={index} className="font-mono">• {article.slug}</li>
                      ))}
                      {result.articles.length > 10 && (
                        <li className="text-gray-600">... and {result.articles.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">❌ Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">What this does</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Removes all articles with slugs starting with &quot;about-&quot;</p>
            <p>• These are typically auto-generated city articles</p>
            <p>• Helps resolve duplicate content issues in Google Search Console</p>
            <p>• Only affects programmatically generated content, not manual articles</p>
          </div>
        </div>
      </div>
    </div>
  )
}
