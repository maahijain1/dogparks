import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if Phoenix city exists
    const { data: phoenixCity, error: cityError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (
          id,
          name
        )
      `)
      .ilike('name', 'Phoenix')

    // Check all listings for Phoenix
    const { data: phoenixListings, error: listingsError } = await supabase
      .from('listings')
      .select(`
        id,
        business,
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
      .ilike('cities.name', 'Phoenix')

    // Check all cities to see what's available
    const { data: allCities, error: allCitiesError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (
          id,
          name
        )
      `)
      .order('name')

    // Check all listings to see what cities have listings
    const { data: allListings, error: allListingsError } = await supabase
      .from('listings')
      .select(`
        id,
        business,
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

    return NextResponse.json({
      success: true,
      phoenixCity: phoenixCity || [],
      cityError: cityError?.message || null,
      phoenixListings: phoenixListings || [],
      listingsError: listingsError?.message || null,
      allCities: allCities || [],
      allCitiesError: allCitiesError?.message || null,
      allListings: allListings || [],
      allListingsError: allListingsError?.message || null,
      summary: {
        phoenixCityCount: phoenixCity?.length || 0,
        phoenixListingsCount: phoenixListings?.length || 0,
        totalCities: allCities?.length || 0,
        totalListings: allListings?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
