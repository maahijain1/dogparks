import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debugging all states - articles and featured listings...')

    // Get all states
    const { data: states, error: statesError } = await supabase
      .from('states')
      .select('id, name, slug')
      .order('name')

    if (statesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch states',
        details: statesError.message
      })
    }

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, state_id, states (name)')
      .order('name')

    if (citiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities',
        details: citiesError.message
      })
    }

    // Get all articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, city_id, published, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (articlesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch articles',
        details: articlesError.message
      })
    }

    // Get all listings with featured status
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, business, city_id, featured, cities (name, state_id)')
      .order('business')

    if (listingsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch listings',
        details: listingsError.message
      })
    }

    // Analyze by state
    const stateAnalysis = states?.map(state => {
      const stateCities = cities?.filter(city => city.state_id === state.id) || []
      const stateArticles = articles?.filter(article => {
        const articleCity = cities?.find(city => city.id === article.city_id)
        return articleCity?.state_id === state.id
      }) || []
      const stateListings = listings?.filter(listing => {
        const listingCity = cities?.find(city => city.id === listing.city_id)
        return listingCity?.state_id === state.id
      }) || []
      const featuredListings = stateListings.filter(listing => listing.featured) || []

      return {
        state: state.name,
        stateId: state.id,
        citiesCount: stateCities.length,
        articlesCount: stateArticles.length,
        listingsCount: stateListings.length,
        featuredCount: featuredListings.length,
        cities: stateCities.map(city => ({
          name: city.name,
          id: city.id,
          articles: stateArticles.filter(article => article.city_id === city.id).length,
          listings: stateListings.filter(listing => listing.city_id === city.id).length,
          featured: featuredListings.filter(listing => listing.city_id === city.id).length
        }))
      }
    }) || []

    // Overall statistics
    const totalStates = states?.length || 0
    const totalCities = cities?.length || 0
    const totalArticles = articles?.length || 0
    const totalListings = listings?.length || 0
    const totalFeatured = listings?.filter(l => l.featured).length || 0

    // States with issues
    const statesWithNoArticles = stateAnalysis.filter(state => state.articlesCount === 0)
    const statesWithNoFeatured = stateAnalysis.filter(state => state.featuredCount === 0)
    const statesWithFewArticles = stateAnalysis.filter(state => state.articlesCount < 3)
    const statesWithFewFeatured = stateAnalysis.filter(state => state.featuredCount < 3)

    return NextResponse.json({
      success: true,
      summary: {
        totalStates,
        totalCities,
        totalArticles,
        totalListings,
        totalFeatured
      },
      stateAnalysis,
      issues: {
        statesWithNoArticles: statesWithNoArticles.length,
        statesWithNoFeatured: statesWithNoFeatured.length,
        statesWithFewArticles: statesWithFewArticles.length,
        statesWithFewFeatured: statesWithFewFeatured.length
      },
      problemStates: {
        noArticles: statesWithNoArticles.map(s => s.state),
        noFeatured: statesWithNoFeatured.map(s => s.state),
        fewArticles: statesWithFewArticles.map(s => s.state),
        fewFeatured: statesWithFewFeatured.map(s => s.state)
      }
    })

  } catch (error) {
    console.error('❌ Error debugging all states:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to debug all states',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
