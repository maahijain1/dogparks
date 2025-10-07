'use client'

import { useState, useEffect } from 'react'

export default function TestArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('Fetching articles...')
        const response = await fetch('/api/articles')
        const data = await response.json()
        console.log('Raw response:', data)
        console.log('Articles count:', data.length)
        setArticles(data)
      } catch (error) {
        console.error('Error:', error)
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Articles Page</h1>
      <p className="mb-4">Found {articles.length} articles</p>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={article.id || index} className="p-4 border rounded">
            <h3 className="font-bold">{article.title}</h3>
            <p className="text-sm">ID: {article.id}</p>
            <p className="text-sm">Published: {article.published ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
