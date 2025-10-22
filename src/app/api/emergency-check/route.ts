import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🚨 EMERGENCY CHECK - Getting real database status...')

    // 1. Check total cities
    const { data: allCities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, state_id')
      .limit(5)

    console.log('Cities sample:', allCities)
    if (citiesError) console.error('Cities error:', citiesError)

    // 2. Check total articles
    const { data: allArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, city_id, published, created_at')
      .limit(10)

    console.log('Articles sample:', allArticles)
    if (articlesError) console.error('Articles error:', articlesError)

    // 3. Count published city articles
    const { count: publishedCount, error: publishedError } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
      .not('city_id', 'is', null)

    console.log('Published city articles count:', publishedCount)
    if (publishedError) console.error('Published count error:', publishedError)

    // 4. Check featured listings
    const { data: featuredListings, error: featuredError } = await supabase
      .from('listings')
      .select('id, business, city_id, featured')
      .eq('featured', true)
      .limit(10)

    console.log('Featured listings sample:', featuredListings)
    if (featuredError) console.error('Featured error:', featuredError)

    // 5. Count featured per city
    const { data: featuredPerCity, error: featuredPerCityError } = await supabase
      .from('listings')
      .select('city_id, featured, cities(name)')
      .eq('featured', true)

    console.log('Featured per city:', featuredPerCity)
    if (featuredPerCityError) console.error('Featured per city error:', featuredPerCityError)

    // 6. Check if city_id column exists
    let hasCityIdColumn = false
    try {
      const { error } = await supabase
        .from('articles')
        .select('city_id')
        .limit(1)
      hasCityIdColumn = !error
    } catch {
      hasCityIdColumn = false
    }

    // 7. Get cities without articles
    const { data: citiesWithArticles } = await supabase
      .from('articles')
      .select('city_id')
      .not('city_id', 'is', null)

    const citiesWithArticlesIds = new Set(citiesWithArticles?.map(a => a.city_id) || [])

    const { data: allCitiesList } = await supabase
      .from('cities')
      .select('id, name')
    
    const citiesWithoutArticles = allCitiesList?.filter(c => !citiesWithArticlesIds.has(c.id)) || []

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checks: {
        totalCities: allCities?.length || 0,
        citiesSample: allCities,
        totalArticles: allArticles?.length || 0,
        articlesSample: allArticles,
        publishedCityArticles: publishedCount || 0,
        featuredListingsCount: featuredListings?.length || 0,
        featuredListingsSample: featuredListings,
        featuredPerCityCount: featuredPerCity?.length || 0,
        hasCityIdColumn,
        citiesWithoutArticles: {
          count: citiesWithoutArticles.length,
          sample: citiesWithoutArticles.slice(0, 10)
        }
      },
      issues: {
        noCityIdColumn: !hasCityIdColumn,
        noPublishedArticles: (publishedCount || 0) === 0,
        noFeaturedListings: (featuredListings?.length || 0) === 0,
        citiesWithoutArticles: citiesWithoutArticles.length
      }
    })

  } catch (error) {
    console.error('❌ Emergency check failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Emergency check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
