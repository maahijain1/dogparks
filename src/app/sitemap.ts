import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/dynamic-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get dynamic site URL from settings
  const settings = await getSiteSettings()
  const baseUrl = settings.site_url || 'https://dogparks.vercel.app'
  const niche = settings.niche || 'Dog Park'
  const nicheSlug = niche.toLowerCase().replace(/\s+/g, '-')
  
  try {
    // Get all published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('published', true)

    // Get all states
    const { data: states } = await supabase
      .from('states')
      .select('name, updated_at')

    // Get all cities
    const { data: cities } = await supabase
      .from('cities')
      .select('name, updated_at')

    const sitemap: MetadataRoute.Sitemap = [
      // Homepage
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Static pages
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      // Articles
      ...(articles?.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })) || []),
      // State pages (format: {niche}-{state})
      ...(states?.map((state) => {
        const stateSlug = state.name.toLowerCase().replace(/\s+/g, '-')
        return {
          url: `${baseUrl}/${nicheSlug}-${stateSlug}`,
          lastModified: new Date(state.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }
      }) || []),
      // City pages (format: city/{city})
      ...(cities?.map((city) => {
        const citySlug = city.name.toLowerCase().replace(/\s+/g, '-')
        return {
          url: `${baseUrl}/city/${citySlug}`,
          lastModified: new Date(city.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      }) || []),
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




