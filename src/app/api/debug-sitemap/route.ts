import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/dynamic-config'

export async function GET(request: NextRequest) {
  try {
    // Get dynamic site URL from settings
    const settings = await getSiteSettings()
    const baseUrl = settings.site_url || 'https://dogparks.vercel.app'
    const niche = settings.niche || 'Dog Park'
    const nicheSlug = niche.toLowerCase().replace(/\s+/g, '-')
    
    console.log('=== SITEMAP DEBUG ===')
    console.log('Base URL:', baseUrl)
    console.log('Niche:', niche)
    console.log('Niche Slug:', nicheSlug)
    
    // Get all published articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('published', true)

    console.log('Articles query result:', { articles: articles?.length, error: articlesError })

    // Get all states
    const { data: states, error: statesError } = await supabase
      .from('states')
      .select('name, updated_at')

    console.log('States query result:', { states: states?.length, error: statesError })

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('name, updated_at')

    console.log('Cities query result:', { cities: cities?.length, error: citiesError })

    // Generate sample URLs
    const sampleUrls = []
    
    if (states && states.length > 0) {
      const stateSlug = states[0].name.toLowerCase().replace(/\s+/g, '-')
      sampleUrls.push(`${baseUrl}/${nicheSlug}-${stateSlug}`)
    }
    
    if (cities && cities.length > 0) {
      const citySlug = cities[0].name.toLowerCase().replace(/\s+/g, '-')
      sampleUrls.push(`${baseUrl}/city/${citySlug}`)
    }
    
    if (articles && articles.length > 0) {
      sampleUrls.push(`${baseUrl}/articles/${articles[0].slug}`)
    }

    return NextResponse.json({
      success: true,
      baseUrl,
      niche,
      nicheSlug,
      statesCount: states?.length || 0,
      citiesCount: cities?.length || 0,
      articlesCount: articles?.length || 0,
      sampleStates: states?.slice(0, 5).map(s => s.name) || [],
      sampleCities: cities?.slice(0, 5).map(c => c.name) || [],
      sampleArticles: articles?.slice(0, 3).map(a => a.slug) || [],
      sampleUrls,
      errors: {
        articlesError: articlesError?.message,
        statesError: statesError?.message,
        citiesError: citiesError?.message
      }
    })

  } catch (error) {
    console.error('Error in sitemap debug:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}
