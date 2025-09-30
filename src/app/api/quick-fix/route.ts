import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🚨 QUICK FIX: Making city pages work NOW!')

    // Step 1: Fix all city slugs
    console.log('1. Fixing city slugs...')
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, slug')

    if (citiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities',
        details: citiesError.message
      })
    }

    let fixedSlugs = 0
    for (const city of cities || []) {
      const correctSlug = city.name.toLowerCase().replace(/\s+/g, '-')
      
      if (city.slug !== correctSlug) {
        const { error: updateError } = await supabase
          .from('cities')
          .update({ slug: correctSlug })
          .eq('id', city.id)

        if (!updateError) {
          fixedSlugs++
          console.log(`Fixed ${city.name}: ${city.slug || 'NO SLUG'} → ${correctSlug}`)
        }
      }
    }

    // Step 2: Test Albury specifically
    console.log('2. Testing Albury...')
    const { data: albury, error: alburyError } = await supabase
      .from('cities')
      .select('id, name, slug, states(name)')
      .or('name.eq.Albury,slug.eq.albury,name.ilike.%albury%')
      .single()

    let alburyStatus = 'NOT FOUND'
    let alburyListings = 0

    if (!alburyError && albury) {
      alburyStatus = `FOUND: ${albury.name} (ID: ${albury.id})`
      
      // Get Albury listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, featured')
        .eq('city_id', albury.id)

      if (!listingsError && listings) {
        alburyListings = listings.length
        console.log(`Albury has ${listings.length} listings`)
      }
    }

    // Step 3: Get all listings count
    const { data: allListings, error: allListingsError } = await supabase
      .from('listings')
      .select('id, business, city_id, featured, cities(name)')

    let totalListings = 0
    let cityBreakdown: Array<{ city: string; count: number; featured: number }> = []

    if (!allListingsError && allListings) {
      totalListings = allListings.length
      
      // Group by city
      const cityGroups = allListings.reduce((acc, listing) => {
        const cityName = (listing.cities as { name?: string })?.name || 'Unknown'
        if (!acc[cityName]) {
          acc[cityName] = []
        }
        acc[cityName].push(listing)
        return acc
      }, {} as Record<string, typeof allListings>)

      cityBreakdown = Object.entries(cityGroups).map(([city, listings]) => ({
        city,
        count: listings.length,
        featured: listings.filter(l => l.featured).length
      }))
    }

    return NextResponse.json({
      success: true,
      message: 'Quick fix completed',
      results: {
        fixedSlugs,
        totalCities: cities?.length || 0,
        alburyStatus,
        alburyListings,
        totalListings,
        cityBreakdown
      }
    })

  } catch (error) {
    console.error('Quick fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Quick fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
