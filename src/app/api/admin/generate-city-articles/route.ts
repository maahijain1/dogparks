import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

// Minimal, self-contained generator that does NOT require the article_templates table
// It creates/updates a single city-specific article per city and attaches city_id

export async function POST() {
  try {
    // Fetch all cities with their state
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
      return NextResponse.json(
        { error: 'Failed to fetch cities', details: citiesError.message },
        { status: 500 }
      )
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json({ success: true, count: 0, generated: [] })
    }

    const results: Array<{ city: string; action: 'created' | 'updated'; slug: string }> = []
    const errors: string[] = []

    const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    type CityRow = {
      id: string
      name: string
      states?: { id?: string; name?: string } | Array<{ id?: string; name?: string }>
    }

    for (const city of cities as CityRow[]) {
      try {
        const cityName = city.name
        const stateRel = Array.isArray(city.states) ? city.states?.[0] : city.states
        const stateName = stateRel?.name || ''
        const citySlug = toSlug(cityName)
        const stateSlug = toSlug(stateName)

        // Unique, stable slug per city
        const slug = stateSlug ? `about-${citySlug}-${stateSlug}` : `about-${citySlug}`

        // Optionally count listings to make content unique
        let listingsCount = 0
        const { data: cityListings, error: listingsError } = await supabase
          .from('listings')
          .select('id')
          .eq('city_id', city.id)

        if (!listingsError && cityListings) {
          listingsCount = cityListings.length
        }

        const title = `About ${cityName} — Local Boarding & Services`
        const content = `
          <h1>About ${cityName}${stateName ? `, ${stateName}` : ''}</h1>
          <p>Find trusted local services, top-rated businesses, and helpful info for residents in ${cityName}. This page is updated to reflect what matters locally.</p>
          <h2>Why ${cityName} pages are unique</h2>
          <ul>
            <li>Local focus: tailored info for ${cityName}${stateName ? `, ${stateName}` : ''}</li>
            <li>Businesses listed here: ${listingsCount}+</li>
            <li>Highlights change as the city grows and services expand</li>
          </ul>
          <h2>Explore services in ${cityName}</h2>
          <p>Browse local listings below, then check back for fresh updates and guides created for ${cityName} residents.</p>
        `.replace(/\n\s+/g, '\n')

        // Check if city_id column exists by trying to query it
        let hasCityIdColumn = true
        try {
          const { error: testError } = await supabase
            .from('articles')
            .select('city_id')
            .limit(1)
          
          if (testError && testError.message.includes('column "city_id" does not exist')) {
            hasCityIdColumn = false
          }
        } catch {
          hasCityIdColumn = false
        }

        // Does an article already exist for this city+slug?
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
            results.push({ city: cityName, action: 'updated', slug })
          }
        } else {
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
            results.push({ city: cityName, action: 'created', slug })
          }
        }
      } catch (err) {
        errors.push(`${city.name}: error — ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({ success: true, count: results.length, results, errors })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate city articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


