'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types/database'

export default function SimpleArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    try {
      setLoading(true)
      console.log('Fetching articles...')
      
      const response = await fetch('/api/articles', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched articles:', data)
      console.log('Articles count:', data.length)
      console.log('Articles type:', typeof data)
      console.log('Is array:', Array.isArray(data))
      
      if (Array.isArray(data)) {
        console.log('Setting articles:', data)
        setArticles(data)
      } else {
        console.log('Data is not an array:', data)
        setArticles([])
      }
      setError(null)
    } catch (error) {
      console.error('Error fetching articles:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateArticle = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          slug: article.slug,
          featured_image: article.featured_image,
          published: !article.published // Toggle published status
        })
      })

      if (response.ok) {
        console.log('Article updated successfully')
        fetchArticles() // Refresh the list
      } else {
        console.error('Failed to update article')
      }
    } catch (error) {
      console.error('Error updating article:', error)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Simple Articles Admin</h1>
        <p>Loading articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Simple Articles Admin</h1>
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchArticles}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Simple Articles Admin</h1>
      <p className="mb-4">Found {articles.length} articles</p>
      
      <div className="mb-4 p-4 bg-yellow-100 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Articles state: {articles.length}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'None'}</p>
      </div>
      
      <button 
        onClick={fetchArticles}
        className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Refresh Articles
      </button>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{article.title}</h3>
              <button
                onClick={() => updateArticle(article)}
                className={`px-4 py-2 rounded ${
                  article.published 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {article.published ? 'Published' : 'Draft'} - Click to Toggle
              </button>
            </div>
            <p className="text-sm text-gray-600">ID: {article.id}</p>
            <p className="text-sm text-gray-600">Slug: {article.slug}</p>
            <p className="text-sm text-gray-600">
              Created: {new Date(article.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
