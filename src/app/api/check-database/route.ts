import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 CHECKING DATABASE SCHEMA...')

    // Check cities table structure
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)

    if (citiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check cities table',
        details: citiesError.message
      })
    }

    // Check what columns exist by looking at the first city
    const cityColumns = cities && cities.length > 0 ? Object.keys(cities[0]) : []
    
    // Try to find Albury without using slug
    const { data: albury, error: alburyError } = await supabase
      .from('cities')
      .select('*')
      .or('name.eq.Albury,name.ilike.%albury%')
      .single()

    // Check listings table
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .limit(1)

    const listingColumns = listings && listings.length > 0 ? Object.keys(listings[0]) : []

    // Get all cities to see the data
    const { data: allCities, error: allCitiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(10)

    return NextResponse.json({
      success: true,
      message: 'Database check completed',
      results: {
        citiesTable: {
          hasData: cities && cities.length > 0,
          columns: cityColumns,
          sampleCity: cities && cities.length > 0 ? cities[0] : null
        },
        listingsTable: {
          hasData: listings && listings.length > 0,
          columns: listingColumns,
          sampleListing: listings && listings.length > 0 ? listings[0] : null
        },
        albury: {
          found: !alburyError && albury,
          data: albury,
          error: alburyError?.message
        },
        allCities: allCities?.slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          hasSlug: 'slug' in c,
          slug: c.slug || 'NO SLUG'
        })) || []
      }
    })

  } catch (error) {
    console.error('Database check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
