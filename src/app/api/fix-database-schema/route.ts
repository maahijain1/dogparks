import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 FIXING DATABASE SCHEMA...')

    // Step 1: Add slug column to cities table
    console.log('1. Adding slug column to cities table...')
    
    // We can't directly run DDL from the API, so let's work around it
    // First, let's check what columns exist
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1)

    if (citiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check cities table',
        details: citiesError.message,
        fix: 'Run this SQL in Supabase: ALTER TABLE cities ADD COLUMN slug TEXT;'
      })
    }

    // Step 2: Check if slug column exists by trying to select it
    const { data: slugTest, error: slugError } = await supabase
      .from('cities')
      .select('slug')
      .limit(1)

    if (slugError && slugError.message.includes('column "slug" does not exist')) {
      return NextResponse.json({
        success: false,
        error: 'Missing slug column',
        details: 'The cities table is missing the slug column',
        fix: 'Run this SQL in your Supabase SQL Editor:\n\nALTER TABLE cities ADD COLUMN slug TEXT;\n\nThen run this API again.'
      })
    }

    // Step 3: If slug column exists, fix all city slugs
    console.log('2. Fixing city slugs...')
    const { data: allCities, error: allCitiesError } = await supabase
      .from('cities')
      .select('id, name, slug')

    if (allCitiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities',
        details: allCitiesError.message
      })
    }

    let fixedSlugs = 0
    for (const city of allCities || []) {
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

    // Step 4: Check Albury specifically
    console.log('3. Checking Albury...')
    const { data: albury, error: alburyError } = await supabase
      .from('cities')
      .select('id, name, slug, states(name)')
      .or('name.eq.Albury,slug.eq.albury,name.ilike.%albury%')
      .single()

    let alburyStatus = 'NOT FOUND'
    let alburyListings = 0

    if (!alburyError && albury) {
      alburyStatus = `FOUND: ${albury.name} (ID: ${albury.id}, Slug: ${albury.slug})`
      
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

    // Step 5: Get total listings
    const { data: allListings, error: allListingsError } = await supabase
      .from('listings')
      .select('id, business, city_id, featured, cities(name)')

    let totalListings = 0
    if (!allListingsError && allListings) {
      totalListings = allListings.length
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema check completed',
      results: {
        fixedSlugs,
        totalCities: allCities?.length || 0,
        alburyStatus,
        alburyListings,
        totalListings,
        citiesSample: allCities?.slice(0, 5).map(c => ({ name: c.name, slug: c.slug })) || []
      }
    })

  } catch (error) {
    console.error('Database schema fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database schema fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
