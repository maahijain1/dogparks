import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://directoryhub.com'
  
  try {
    // Get all published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('published', true)

    // Get all states
    const { data: states } = await supabase
      .from('states')
      .select('slug, updated_at')

    // Get all cities
    const { data: cities } = await supabase
      .from('cities')
      .select('slug, updated_at')

    const sitemap: MetadataRoute.Sitemap = [
      // Homepage
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Articles
      ...(articles?.map((article) => ({
        url: `${baseUrl}/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })) || []),
      // States
      ...(states?.map((state) => ({
        url: `${baseUrl}/state/${state.slug}`,
        lastModified: new Date(state.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })) || []),
      // Cities
      ...(cities?.map((city) => ({
        url: `${baseUrl}/city/${city.slug}`,
        lastModified: new Date(city.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || []),
    ]

    return sitemap
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}




