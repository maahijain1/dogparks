import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getCityTemplateData, generateCityPageContent, getCityPageStyles } from '@/lib/city-page-template-generator'

export async function POST() {
  try {
    console.log('🎨 Starting beautiful article generation...')

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

        // Get template data for this city
        const templateData = await getCityTemplateData(city.id)
        
        // Generate beautiful content using the template
        const content = generateCityPageContent(templateData)
        const styles = getCityPageStyles()
        
        // Combine styles and content
        const fullContent = styles + content

        const title = `Professional ${templateData.NICHE} Services in ${cityName} | ${templateData.SITE_NAME}`

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
            content: fullContent, 
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
            console.log(`✅ Updated beautiful article for ${cityName}, ${stateName}`)
          }
        } else {
          // Create new article
          const insertData: Record<string, unknown> = {
            title,
            content: fullContent,
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
            console.log(`✅ Created beautiful article for ${cityName}, ${stateName}`)
          }
        }
      } catch (err) {
        const errorMsg = `${city.name}: error — ${err instanceof Error ? err.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    console.log(`🎉 Beautiful article generation complete! Generated: ${results.length}, Errors: ${errors.length}`)

    return NextResponse.json({ 
      success: true, 
      count: results.length, 
      generated: results, 
      errors,
      message: `Successfully processed ${results.length} cities with beautiful templates. ${errors.length} errors occurred.`
    })
  } catch (error) {
    console.error('❌ Fatal error in beautiful article generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate beautiful articles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
