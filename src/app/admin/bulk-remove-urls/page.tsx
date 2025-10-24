'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

export default function BulkRemoveURLsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    deleted: number;
    message: string;
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBulkDelete = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/bulk-remove-urls', {
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
              <h1 className="text-3xl font-bold text-gray-900">Bulk Remove About Articles</h1>
              <p className="text-gray-600 mt-1">Delete ALL about-* articles at once (1000+ URLs)</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-900 mb-2">⚠️ Mass Deletion Warning</h3>
              <div className="text-sm text-red-800 space-y-2">
                <p>This will delete <strong>ALL articles</strong> with slugs starting with &quot;about-&quot;.</p>
                <p>Based on your report, this could be <strong>1000+ articles</strong>.</p>
                <p className="font-medium">This action cannot be undone!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Search Console Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <ExternalLink className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 Fast Google Index Removal</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>After deleting articles, use this pattern in Google Search Console:</strong></p>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  <code>https://www.dogboardingkennels.us/about-*</code>
                </div>
                <p>This single pattern will remove ALL about-* URLs from Google&apos;s index!</p>
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>Go to <a href="https://search.google.com/search-console/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a></li>
                  <li>Removals → New Request → Temporarily remove URL</li>
                  <li>Enter the pattern above</li>
                  <li>Submit the request</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Delete All About Articles</h3>
          <p className="text-gray-600 mb-6">
            This will remove all programmatically generated about-* articles that are causing duplicate content issues.
            <strong> This is a one-time operation that will delete 1000+ articles.</strong>
          </p>
          
          <button
            onClick={handleBulkDelete}
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
                Deleting 1000+ Articles...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ALL About Articles (1000+)
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
                <h3 className="text-lg font-medium text-green-900 mb-2">✅ Bulk Deletion Complete!</h3>
                <p className="text-green-800">
                  Successfully deleted {result.deleted} about-* articles.
                </p>
                <div className="mt-4 bg-white p-4 rounded border">
                  <p className="text-sm font-medium text-gray-900 mb-2">Next Steps:</p>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Go to Google Search Console</li>
                    <li>Use pattern: <code className="bg-gray-100 px-2 py-1 rounded">https://www.dogboardingkennels.us/about-*</code></li>
                    <li>Submit bulk removal request</li>
                    <li>Monitor removal status</li>
                  </ol>
                </div>
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
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Why This Approach Works</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• <strong>Bulk deletion</strong> removes all articles at once from your database</p>
            <p>• <strong>Pattern-based removal</strong> in Google Search Console handles all URLs with one request</p>
            <p>• <strong>Robots.txt</strong> prevents future indexing of about-* URLs</p>
            <p>• <strong>404 responses</strong> tell Google these pages no longer exist</p>
          </div>
        </div>
      </div>
    </div>
  )
}
