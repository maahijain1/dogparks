'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/database'

export default function TestArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('Fetching articles...')
        const response = await fetch('/api/articles', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Fetched articles:', data)
        console.log('Articles count:', data.length)
        
        setArticles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching articles:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Articles Page</h1>
        <p>Loading articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Articles Page</h1>
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Articles Page</h1>
      <p className="mb-4">Found {articles.length} articles</p>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{article.title}</h3>
            <p className="text-sm text-gray-600">ID: {article.id}</p>
            <p className="text-sm text-gray-600">Slug: {article.slug}</p>
            <p className="text-sm text-gray-600">
              Published: {article.published ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-gray-600">
              Created: {new Date(article.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
