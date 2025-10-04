'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Article {
  id: string
  title: string
  slug: string
  published: boolean
  featured_image?: string
  created_at: string
}

export default function DebugArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, slug, published, featured_image, created_at')
          .order('created_at', { ascending: false })

        if (error) {
          setError(error.message)
        } else {
          setArticles(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) return <div className="p-8">Loading articles...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Articles</h1>
      <p className="mb-4">Total articles: {articles.length}</p>
      
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="border p-4 rounded">
            <h3 className="font-bold">{article.title}</h3>
            <p className="text-sm text-gray-600">Slug: {article.slug}</p>
            <p className="text-sm text-gray-600">Published: {article.published ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">Image: {article.featured_image ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">Created: {new Date(article.created_at).toLocaleDateString()}</p>
            <a 
              href={`/${article.slug}`} 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Article
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
