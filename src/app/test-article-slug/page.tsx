'use client'

import { useState } from 'react'

export default function TestArticleSlugPage() {
  const [result, setResult] = useState<{
    apiData?: unknown
    allArticles?: number
    specificArticle?: unknown
    testSlug?: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const testSlug = 'how-much-does-dog-boarding-cost-in-the-usa'

  const testArticle = async () => {
    setLoading(true)
    try {
      // Test API endpoint
      const apiResponse = await fetch('/api/debug-articles')
      const apiData = await apiResponse.json()
      
      // Test specific slug
      const slugResponse = await fetch(`/api/articles`)
      const allArticles = await slugResponse.json()
      const specificArticle = allArticles.find((a: { slug: string }) => a.slug === testSlug)
      
      setResult({
        apiData,
        allArticles: allArticles?.length || 0,
        specificArticle,
        testSlug
      })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Article Slug</h1>
      <button 
        onClick={testArticle}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Article'}
      </button>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
