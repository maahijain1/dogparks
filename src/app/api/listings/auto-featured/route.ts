import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { action, cityId, stateId } = await request.json()

    if (!action || !['select', 'clear'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "select" or "clear"' },
        { status: 400 }
      )
    }

    const stats = {
      citiesProcessed: 0,
      listingsUpdated: 0,
      citiesWithListings: 0,
      citiesWithoutListings: 0,
      errors: [] as string[]
    }

    // Get cities to process
    let citiesToProcess: Array<{id: string, name: string}> = []

    if (cityId) {
      // Process single city
      const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('id', cityId)
        .single()

      if (cityError || !city) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        )
      }
      citiesToProcess = [city]
    } else if (stateId) {
      // Process all cities in state
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', stateId)

      if (citiesError) {
        return NextResponse.json(
          { error: 'Failed to fetch cities', details: citiesError.message },
          { status: 500 }
        )
      }
      citiesToProcess = cities || []
    } else {
      // Process all cities
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')

      if (citiesError) {
        return NextResponse.json(
          { error: 'Failed to fetch cities', details: citiesError.message },
          { status: 500 }
        )
      }
      citiesToProcess = cities || []
    }

    console.log(`Processing ${citiesToProcess.length} cities for action: ${action}`)

    // Process each city
    for (const city of citiesToProcess) {
      stats.citiesProcessed++

      try {
        if (action === 'clear') {
          // Clear all featured listings in this city
          const { data: clearedListings, error: clearError } = await supabase
            .from('listings')
            .update({ featured: false })
            .eq('city_id', city.id)
            .eq('featured', true)
            .select('id')

          if (clearError) {
            stats.errors.push(`${city.name}: Failed to clear featured listings - ${clearError.message}`)
            continue
          }

          const clearedCount = clearedListings?.length || 0
          stats.listingsUpdated += clearedCount
          console.log(`✅ Cleared ${clearedCount} featured listings in ${city.name}`)

        } else if (action === 'select') {
          // Get all non-featured listings in this city (with phone numbers for quality)
          const { data: availableListings, error: listingsError } = await supabase
            .from('listings')
            .select('id, business, phone, review_rating')
            .eq('city_id', city.id)
            .eq('featured', false)
            .not('phone', 'is', null)
            .neq('phone', '')

          if (listingsError) {
            stats.errors.push(`${city.name}: Failed to fetch listings - ${listingsError.message}`)
            continue
          }

          if (!availableListings || availableListings.length === 0) {
            stats.citiesWithoutListings++
            console.log(`⚠️ No available listings in ${city.name}`)
            continue
          }

          stats.citiesWithListings++

          // Sort by quality (rating first, then randomly)
          const qualityListings = availableListings
            .sort((a, b) => {
              // First sort by rating (higher is better)
              const ratingA = parseFloat(a.review_rating?.toString() || '0')
              const ratingB = parseFloat(b.review_rating?.toString() || '0')
              if (ratingB !== ratingA) {
                return ratingB - ratingA
              }
              // Then random for same ratings
              return Math.random() - 0.5
            })

          // Select up to 3 listings
          const listingsToFeature = qualityListings.slice(0, Math.min(3, qualityListings.length))

          if (listingsToFeature.length > 0) {
            const listingIds = listingsToFeature.map(l => l.id)

            const { data: updatedListings, error: updateError } = await supabase
              .from('listings')
              .update({ featured: true })
              .in('id', listingIds)
              .select('id, business')

            if (updateError) {
              stats.errors.push(`${city.name}: Failed to update featured listings - ${updateError.message}`)
              continue
            }

            const updatedCount = updatedListings?.length || 0
            stats.listingsUpdated += updatedCount

            console.log(`✅ Featured ${updatedCount} listings in ${city.name}:`, 
              updatedListings?.map(l => l.business).join(', '))
          }
        }

      } catch (error) {
        stats.errors.push(`${city.name}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`)
        continue
      }
    }

    console.log('Auto-featured processing completed:', stats)

    const actionText = action === 'select' ? 'selected' : 'cleared'
    const message = `Auto-featured ${actionText} completed successfully`

    return NextResponse.json({
      message,
      stats
    }, { status: 200 })

  } catch (error) {
    console.error('Auto-featured error:', error)
    return NextResponse.json(
      { error: 'Auto-featured operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
