'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ArticleRenderer from './ArticleRenderer'
import Link from 'next/link'
import { FileText, ExternalLink } from 'lucide-react'

interface Article {
  id: string
  title: string
  content: string
  slug: string
  featured_image: string
  published: boolean
  created_at: string
  template_id?: string
  city_id?: string
}

interface ArticlesSectionProps {
  cityId?: string
  cityName?: string
  stateId?: string
  stateName?: string
}

export default function ArticlesSection({ cityId, cityName, stateId, stateName }: ArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })

        // If we have a cityId, filter by city-specific articles
        if (cityId) {
          // Check if city_id column exists by trying to filter
          try {
            query = query.eq('city_id', cityId)
          } catch (error) {
            // If city_id column doesn't exist, fall back to showing all published articles
            console.warn('city_id column not found, showing all articles')
          }
        } else if (stateId) {
          // For state pages, get articles from all cities in that state
          try {
            const { data: stateCities } = await supabase
              .from('cities')
              .select('id')
              .eq('state_id', stateId)
            
            if (stateCities && stateCities.length > 0) {
              query = query.in('city_id', stateCities.map(c => c.id))
            }
          } catch (error) {
            // If city_id column doesn't exist, fall back to showing all published articles
            console.warn('city_id column not found, showing all articles')
          }
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        setArticles(data || [])
      } catch (error) {
        console.error('Error fetching articles:', error)
        setError('Failed to load articles')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [cityId, stateId])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading articles...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (articles.length === 0) {
    return null // Don't show section if no articles
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              Articles About {cityName || stateName}
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover helpful articles and insights about {cityName || stateName} and the local area
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {articles.map((article) => (
            <article key={article.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {article.featured_image && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                
                <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                  <ArticleRenderer content={article.content} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  <Link
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read More
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length > 2 && (
          <div className="text-center mt-8">
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Articles
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
