import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getCityTemplateData, generateCityPageContent, getCityPageStyles } from '@/lib/city-page-template-generator'

export async function POST() {
  try {
    console.log('🚀 NUCLEAR FIX - Starting comprehensive database fix...')

    const results = {
      articlesGenerated: 0,
      articlesUpdated: 0,
      featuredFixed: 0,
      errors: [] as string[]
    }

    // STEP 1: Get ALL cities from database
    const { data: allCities, error: citiesError } = await supabase
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

    if (citiesError) {
      throw new Error(`Failed to fetch cities: ${citiesError.message}`)
    }

    if (!allCities || allCities.length === 0) {
      throw new Error('No cities found in database')
    }

    console.log(`📊 Found ${allCities.length} cities to process`)

    type CityRow = {
      id: string
      name: string
      states?: { id?: string; name?: string } | Array<{ id?: string; name?: string }>
    }

    const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // STEP 2: Generate articles for ALL cities
    console.log('📝 Generating articles for all cities...')
    
    for (const city of allCities as CityRow[]) {
      try {
        const cityName = city.name
        const stateRel = Array.isArray(city.states) ? city.states?.[0] : city.states
        const stateName = stateRel?.name || 'Unknown State'
        const citySlug = toSlug(cityName)
        const stateSlug = toSlug(stateName)
        const slug = stateSlug ? `about-${citySlug}-${stateSlug}` : `about-${citySlug}`

        // Get template data
        const templateData = await getCityTemplateData(city.id)
        const content = generateCityPageContent(templateData)
        const styles = getCityPageStyles()
        const fullContent = styles + content
        const title = `Professional ${templateData.NICHE} Services in ${cityName} | ${templateData.SITE_NAME}`

        // Check if article exists for this city
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('city_id', city.id)
          .maybeSingle()

        if (existingArticle) {
          // Update existing article
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              title,
              content: fullContent,
              slug,
              published: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingArticle.id)

          if (updateError) {
            results.errors.push(`${cityName}: Update failed - ${updateError.message}`)
          } else {
            results.articlesUpdated++
            console.log(`✅ Updated article for ${cityName}, ${stateName}`)
          }
        } else {
          // Create new article
          const { error: insertError } = await supabase
            .from('articles')
            .insert({
              title,
              content: fullContent,
              slug,
              city_id: city.id,
              featured_image: '',
              published: true,
              created_at: new Date().toISOString()
            })

          if (insertError) {
            results.errors.push(`${cityName}: Create failed - ${insertError.message}`)
          } else {
            results.articlesGenerated++
            console.log(`✅ Created article for ${cityName}, ${stateName}`)
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`${city.name}: ${errorMsg}`)
        console.error(`❌ Error processing ${city.name}:`, error)
      }
    }

    // STEP 3: Fix featured listings for ALL cities
    console.log('⭐ Fixing featured listings for all cities...')
    
    for (const city of allCities as CityRow[]) {
      try {
        // Get all listings for this city
        const { data: cityListings, error: listingsError } = await supabase
          .from('listings')
          .select('id, featured')
          .eq('city_id', city.id)
          .order('id')

        if (listingsError) {
          results.errors.push(`${city.name} listings: ${listingsError.message}`)
          continue
        }

        if (!cityListings || cityListings.length === 0) {
          continue // No listings for this city
        }

        const currentFeatured = cityListings.filter(l => l.featured).length
        const totalListings = cityListings.length

        // Ensure we have 3 featured (or all if less than 3)
        const targetFeatured = Math.min(3, totalListings)

        if (currentFeatured < targetFeatured) {
          // Need to feature more listings
          const nonFeatured = cityListings.filter(l => !l.featured)
          const toFeature = targetFeatured - currentFeatured

          for (let i = 0; i < toFeature && i < nonFeatured.length; i++) {
            const { error: updateError } = await supabase
              .from('listings')
              .update({ featured: true })
              .eq('id', nonFeatured[i].id)

            if (!updateError) {
              results.featuredFixed++
            }
          }
          
          console.log(`✅ Featured ${toFeature} listings for ${city.name}`)
        } else if (currentFeatured > targetFeatured) {
          // Too many featured, unfeature some
          const featured = cityListings.filter(l => l.featured)
          const toUnfeature = currentFeatured - targetFeatured

          for (let i = 0; i < toUnfeature && i < featured.length; i++) {
            await supabase
              .from('listings')
              .update({ featured: false })
              .eq('id', featured[i].id)
          }
          
          console.log(`✅ Unfeatured ${toUnfeature} listings for ${city.name}`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`${city.name} featured: ${errorMsg}`)
        console.error(`❌ Error fixing featured for ${city.name}:`, error)
      }
    }

    console.log('🎉 NUCLEAR FIX COMPLETE!')
    console.log(`📊 Results:`)
    console.log(`   - Articles generated: ${results.articlesGenerated}`)
    console.log(`   - Articles updated: ${results.articlesUpdated}`)
    console.log(`   - Featured listings fixed: ${results.featuredFixed}`)
    console.log(`   - Errors: ${results.errors.length}`)

    return NextResponse.json({
      success: true,
      message: `Nuclear fix complete! Generated ${results.articlesGenerated} articles, updated ${results.articlesUpdated} articles, fixed ${results.featuredFixed} featured listings.`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ NUCLEAR FIX FAILED:', error)
    return NextResponse.json({
      success: false,
      error: 'Nuclear fix failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
