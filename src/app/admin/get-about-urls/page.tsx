'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

interface AboutURL {
  url: string
  slug: string
  title: string
  created_at: string
}

export default function GetAboutURLsPage() {
  const [urls, setUrls] = useState<AboutURL[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchURLs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/get-about-urls')
      const data = await response.json()
      
      if (response.ok) {
        setUrls(data.urls || [])
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchURLs()
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const copyAllURLs = () => {
    const allUrls = urls.map(u => u.url).join('\n')
    copyToClipboard(allUrls)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Admin
          </Link>
          
          <div className="flex items-center">
            <ExternalLink className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About URLs for Google Removal</h1>
              <p className="text-gray-600 mt-1">Get all about-* URLs to remove from Google Search Console</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Found URLs</h3>
              <p className="text-2xl font-bold text-blue-600">{urls.length}</p>
            </div>
            <button
              onClick={fetchURLs}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">How to Remove from Google Index</h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <p><strong>Step 1:</strong> Go to <a href="https://search.google.com/search-console/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a></p>
                <p><strong>Step 2:</strong> Go to "Removals" → "New Request" → "Temporarily remove URL"</p>
                <p><strong>Step 3:</strong> Copy and paste the URLs below (one by one or in bulk)</p>
                <p><strong>Step 4:</strong> Submit the removal requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copy All Button */}
        {urls.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Copy All URLs</h3>
                <p className="text-sm text-gray-600">Copy all URLs at once for bulk removal</p>
              </div>
              <button
                onClick={copyAllURLs}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {copied === urls.map(u => u.url).join('\n') ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All URLs
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* URLs List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading URLs...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">No About URLs Found</h3>
                <p className="text-green-800">All about-* articles have been successfully removed!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">URLs to Remove from Google Index</h3>
              <p className="text-sm text-gray-600">Click the copy button next to each URL to copy it individually</p>
            </div>
            <div className="divide-y divide-gray-200">
              {urls.map((url, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{url.url}</p>
                    <p className="text-sm text-gray-500">Slug: {url.slug}</p>
                    <p className="text-xs text-gray-400">Created: {new Date(url.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(url.url)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {copied === url.url ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Test
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Important Notes</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>URL Removal is temporary</strong> - Google will re-crawl these URLs after 90 days</p>
            <p>• <strong>Since the articles are deleted</strong>, they will return 404 errors when re-crawled</p>
            <p>• <strong>This is the correct approach</strong> for handling deleted content</p>
            <p>• <strong>Monitor Google Search Console</strong> for removal status updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}
