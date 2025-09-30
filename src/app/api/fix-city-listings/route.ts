import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 FIXING CITY-LISTING LINKS...')

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, states(name)')

    if (citiesError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities',
        details: citiesError.message
      })
    }

    // Get all listings
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, business, city_id, cities(name)')

    if (listingsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch listings',
        details: listingsError.message
      })
    }

    console.log(`Found ${cities?.length || 0} cities and ${listings?.length || 0} listings`)

    // Create a mapping of city names to city IDs
    const cityMap = new Map()
    cities?.forEach(city => {
      cityMap.set(city.name.toLowerCase(), city.id)
      console.log(`City: ${city.name} -> ID: ${city.id}`)
    })

    let fixedCount = 0
    const errors: string[] = []

    // Fix each listing
    for (const listing of listings || []) {
      const currentCityName = (listing.cities as { name?: string })?.name
      console.log(`\nProcessing listing: ${listing.business}`)
      console.log(`Current city: ${currentCityName}`)
      console.log(`Current city_id: ${listing.city_id}`)

      // Try to find the correct city by name matching
      let correctCityId = null
      
      // First try exact match
      if (currentCityName) {
        correctCityId = cityMap.get(currentCityName.toLowerCase())
      }

      // If not found, try to extract city name from business name or address
      if (!correctCityId) {
        // Try to find city name in business name
        for (const [cityName, cityId] of cityMap.entries()) {
          if (listing.business.toLowerCase().includes(cityName)) {
            correctCityId = cityId
            console.log(`Found city match in business name: ${cityName}`)
            break
          }
        }
      }

      if (correctCityId && correctCityId !== listing.city_id) {
        console.log(`Updating listing ${listing.business} from city_id ${listing.city_id} to ${correctCityId}`)
        
        const { error: updateError } = await supabase
          .from('listings')
          .update({ city_id: correctCityId })
          .eq('id', listing.id)

        if (updateError) {
          errors.push(`Failed to update ${listing.business}: ${updateError.message}`)
        } else {
          fixedCount++
          console.log(`✅ Fixed: ${listing.business}`)
        }
      } else if (correctCityId) {
        console.log(`✅ Already correct: ${listing.business}`)
      } else {
        console.log(`❌ Could not find city for: ${listing.business}`)
        errors.push(`Could not find city for: ${listing.business}`)
      }
    }

    // Get updated counts per city
    const cityCounts = []
    for (const city of cities || []) {
      const { data: cityListings, error: cityListingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('city_id', city.id)

      if (!cityListingsError) {
        cityCounts.push({
          city: city.name,
          count: cityListings?.length || 0
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'City-listing links fixed',
      results: {
        totalCities: cities?.length || 0,
        totalListings: listings?.length || 0,
        fixedCount,
        errors: errors.slice(0, 10), // Show first 10 errors
        cityCounts: cityCounts.sort((a, b) => b.count - a.count)
      }
    })

  } catch (error) {
    console.error('Fix city-listings error:', error)
    return NextResponse.json({
      success: false,
      error: 'Fix city-listings failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
