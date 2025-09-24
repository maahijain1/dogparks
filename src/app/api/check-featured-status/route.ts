import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all listings with their featured status
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select(`
        id,
        business,
        featured,
        city_id,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )
      `)
      .order('business')

    if (listingsError) {
      return NextResponse.json({
        success: false,
        error: listingsError.message
      })
    }

    // Count featured listings
    const featuredCount = listings?.filter(listing => listing.featured === true).length || 0
    const totalCount = listings?.length || 0

    // Get featured listings specifically
    const { data: featuredListings, error: featuredError } = await supabase
      .from('listings')
      .select(`
        id,
        business,
        featured,
        city_id,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )
      `)
      .eq('featured', true)

    return NextResponse.json({
      success: true,
      totalListings: totalCount,
      featuredCount: featuredCount,
      featuredListings: featuredListings || [],
      allListings: listings || [],
      featuredError: featuredError?.message || null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}






