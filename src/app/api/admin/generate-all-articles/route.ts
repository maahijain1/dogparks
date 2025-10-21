import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive article generation...')

    // Fetch all cities with their states
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (
          id,
          name
        )
      `)

    if (citiesError) {
      console.error('❌ Error fetching cities:', citiesError)
      return NextResponse.json(
        { error: 'Failed to fetch cities', details: citiesError.message },
        { status: 500 }
      )
    }

    if (!cities || cities.length === 0) {
      console.log('⚠️ No cities found')
      return NextResponse.json({ success: true, count: 0, generated: [], message: 'No cities found' })
    }

    console.log(`📊 Found ${cities.length} cities to process`)

    const results: Array<{ city: string; state: string; action: 'created' | 'updated'; slug: string }> = []
    const errors: string[] = []

    const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    type CityRow = {
      id: string
      name: string
      states?: { id?: string; name?: string } | Array<{ id?: string; name?: string }>
    }

    // Check if city_id column exists
    let hasCityIdColumn = true
    try {
      const { error: testError } = await supabase
        .from('articles')
        .select('city_id')
        .limit(1)
      
      if (testError && testError.message.includes('column "city_id" does not exist')) {
        hasCityIdColumn = false
        console.log('⚠️ city_id column does not exist, articles will not be city-specific')
      }
    } catch {
      hasCityIdColumn = false
      console.log('⚠️ city_id column does not exist, articles will not be city-specific')
    }

    for (const city of cities as CityRow[]) {
      try {
        const cityName = city.name
        const stateRel = Array.isArray(city.states) ? city.states?.[0] : city.states
        const stateName = stateRel?.name || 'Unknown State'
        const citySlug = toSlug(cityName)
        const stateSlug = toSlug(stateName)

        // Unique, stable slug per city
        const slug = stateSlug ? `about-${citySlug}-${stateSlug}` : `about-${citySlug}`

        // Count listings for this city
        let listingsCount = 0
        let featuredCount = 0
        const { data: cityListings, error: listingsError } = await supabase
          .from('listings')
          .select('id, featured')
          .eq('city_id', city.id)

        if (!listingsError && cityListings) {
          listingsCount = cityListings.length
          featuredCount = cityListings.filter(l => l.featured).length
        }

        // Create comprehensive content
        const title = `About ${cityName} — Local Pet Services & Boarding`
        const content = `
          <h1>About ${cityName}${stateName ? `, ${stateName}` : ''}</h1>
          <p>Welcome to ${cityName}${stateName ? `, ${stateName}` : ''}! This comprehensive guide helps you find the best local pet services, boarding facilities, and animal care providers in your area.</p>
          
          <h2>Why Choose ${cityName} for Pet Services?</h2>
          <ul>
            <li><strong>Local Expertise:</strong> Our directory features ${listingsCount}+ verified businesses serving ${cityName} residents</li>
            <li><strong>Featured Providers:</strong> ${featuredCount} top-rated services highlighted for quality and reliability</li>
            <li><strong>Comprehensive Coverage:</strong> From pet boarding to grooming, veterinary care to training</li>
            <li><strong>Community Trust:</strong> All listings are verified and regularly updated</li>
          </ul>

          <h2>Services Available in ${cityName}</h2>
          <p>Whether you need short-term boarding, long-term care, or specialized services, ${cityName} offers a wide range of options:</p>
          <ul>
            <li><strong>Pet Boarding:</strong> Safe, comfortable accommodations for your pets</li>
            <li><strong>Dog Daycare:</strong> Socialization and exercise for active dogs</li>
            <li><strong>Pet Grooming:</strong> Professional grooming services for all breeds</li>
          </ul>

          <h2>Finding the Right Service Provider</h2>
          <p>Our directory makes it easy to find the perfect match for your pet's needs. Browse through our featured listings below to discover top-rated providers in ${cityName}.</p>
          
          <h2>Local Pet Community</h2>
          <p>${cityName} is home to a vibrant pet community with dedicated service providers who understand the unique needs of local pet owners. From experienced veterinarians to specialized trainers, you'll find everything you need right here.</p>
        `.replace(/\n\s+/g, '\n')

        // Check if article already exists
        let existing = null
        if (hasCityIdColumn) {
          const { data: existingData } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', slug)
            .eq('city_id', city.id)
            .single()
          existing = existingData
        } else {
          // Fallback: check by slug only
          const { data: existingData } = await supabase
            .from('articles')
            .select('id')
            .eq('slug', slug)
            .single()
          existing = existingData
        }

        if (existing) {
          // Update existing article
          const updateData: Record<string, unknown> = { 
            title, 
            content, 
            updated_at: new Date().toISOString(), 
            published: true 
          }
          
          if (hasCityIdColumn) {
            updateData.city_id = city.id
          }

          const { error: updateError } = await supabase
            .from('articles')
            .update(updateData)
            .eq('id', existing.id)

          if (updateError) {
            errors.push(`${cityName}: update failed — ${updateError.message}`)
          } else {
            results.push({ city: cityName, state: stateName, action: 'updated', slug })
            console.log(`✅ Updated article for ${cityName}, ${stateName}`)
          }
        } else {
          // Create new article
          const insertData: Record<string, unknown> = {
            title,
            content,
            slug,
            featured_image: '',
            published: true
          }
          
          if (hasCityIdColumn) {
            insertData.city_id = city.id
          }

          const { error: insertError } = await supabase
            .from('articles')
            .insert(insertData)

          if (insertError) {
            errors.push(`${cityName}: create failed — ${insertError.message}`)
          } else {
            results.push({ city: cityName, state: stateName, action: 'created', slug })
            console.log(`✅ Created article for ${cityName}, ${stateName}`)
          }
        }
      } catch (err) {
        const errorMsg = `${city.name}: error — ${err instanceof Error ? err.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    console.log(`🎉 Article generation complete! Generated: ${results.length}, Errors: ${errors.length}`)

    return NextResponse.json({ 
      success: true, 
      count: results.length, 
      generated: results, 
      errors,
      message: `Successfully processed ${results.length} cities. ${errors.length} errors occurred.`
    })
  } catch (error) {
    console.error('❌ Fatal error in article generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
