import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Starting to fix all cities...')

    // Get all cities
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

    console.log(`Found ${cities?.length || 0} cities`)

    let fixedCount = 0
    const results = []

    // Fix each city's slug
    for (const city of cities || []) {
      const correctSlug = city.name.toLowerCase().replace(/\s+/g, '-')
      
      if (city.slug !== correctSlug) {
        const { error: updateError } = await supabase
          .from('cities')
          .update({ slug: correctSlug })
          .eq('id', city.id)

        if (updateError) {
          results.push({
            city: city.name,
            status: 'error',
            message: updateError.message
          })
        } else {
          results.push({
            city: city.name,
            status: 'fixed',
            oldSlug: city.slug || 'NO SLUG',
            newSlug: correctSlug
          })
          fixedCount++
        }
      } else {
        results.push({
          city: city.name,
          status: 'already_correct',
          slug: city.slug
        })
      }
    }

    // Test a few cities to make sure they work
    const testResults = []
    const testCities = cities?.slice(0, 3) || []
    
    for (const city of testCities) {
      const slug = city.name.toLowerCase().replace(/\s+/g, '-')
      
      // Test city lookup
      const { data: foundCity, error: cityError } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

      if (cityError || !foundCity) {
        testResults.push({
          city: city.name,
          slug: slug,
          status: 'failed',
          error: cityError?.message
        })
      } else {
        // Test listings
        const { data: listings } = await supabase
          .from('listings')
          .select('id, business, featured')
          .eq('city_id', foundCity.id)

        testResults.push({
          city: city.name,
          slug: slug,
          status: 'success',
          listings: listings?.length || 0,
          featured: listings?.filter(l => l.featured).length || 0
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} cities out of ${cities?.length || 0}`,
      totalCities: cities?.length || 0,
      fixedCount,
      results,
      testResults
    })

  } catch (error) {
    console.error('Error fixing cities:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix cities',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
