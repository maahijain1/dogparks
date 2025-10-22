'use client'

import { useState, useEffect } from 'react'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import ArticleRenderer from './ArticleRenderer'
import Image from 'next/image'

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
  stateId?: string
}

export default function ArticlesSection({ cityId, stateId }: ArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 ArticlesSection: Fetching articles for cityId:', cityId, 'stateId:', stateId)

        let query = supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })

        // If we have a cityId, filter by city-specific articles
        if (cityId) {
          console.log('🔍 ArticlesSection: Filtering by cityId:', cityId)
          // Check if city_id column exists by trying to filter
          try {
            query = query.eq('city_id', cityId)
            console.log('🔍 ArticlesSection: Added city_id filter')
          } catch (err) {
            // If city_id column doesn't exist, fall back to showing all published articles
            console.warn('city_id column not found, showing all articles', err)
          }
        } else if (stateId) {
          console.log('🔍 ArticlesSection: Filtering by stateId:', stateId)
          // For state pages, get articles from all cities in that state
          try {
            const { data: stateCities } = await supabase
              .from('cities')
              .select('id')
              .eq('state_id', stateId)
            
            console.log('🔍 ArticlesSection: Found cities for state:', stateCities)
            
            if (stateCities && stateCities.length > 0) {
              query = query.in('city_id', stateCities.map(c => c.id))
              console.log('🔍 ArticlesSection: Added state cities filter')
            }
          } catch (err) {
            // If city_id column doesn't exist, fall back to showing all published articles
            console.warn('city_id column not found, showing all articles', err)
          }
        }

        console.log('🔍 ArticlesSection: Executing query...')
        const { data, error } = await query

        if (error) {
          console.error('🔍 ArticlesSection: Query error:', error)
          throw error
        }

        console.log('🔍 ArticlesSection: Found articles:', data?.length || 0, data)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {articles.map((article) => (
          <article key={article.id} className="mb-12">
            {article.featured_image && (
              <div className="mb-6">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {article.title}
              </h2>
              
              <div className="prose prose-lg max-w-none text-gray-700">
                <ArticleRenderer content={article.content} />
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
