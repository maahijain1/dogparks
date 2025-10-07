'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/database'

export default function DebugArticlesPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch all articles
        const allRes = await fetch('/api/articles')
        const allData = await allRes.json()
        setAllArticles(Array.isArray(allData) ? allData : [])

        // Fetch published articles only
        const publishedRes = await fetch('/api/articles?published=true')
        const publishedData = await publishedRes.json()
        setPublishedArticles(Array.isArray(publishedData) ? publishedData : [])
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Article Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* All Articles */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Articles ({allArticles.length})</h2>
          <div className="space-y-4">
            {allArticles.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{article.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    article.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Slug: {article.slug}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(article.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Published Articles */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Published Articles ({publishedArticles.length})</h2>
          <div className="space-y-4">
            {publishedArticles.map((article) => (
              <div key={article.id} className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{article.title}</h3>
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    Published
                  </span>
                </div>
                <p className="text-sm text-gray-600">Slug: {article.slug}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(article.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Total articles in database: {allArticles.length}</p>
        <p>Published articles: {publishedArticles.length}</p>
        <p>Draft articles: {allArticles.length - publishedArticles.length}</p>
      </div>
    </div>
  )
}