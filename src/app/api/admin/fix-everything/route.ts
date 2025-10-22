import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getCityTemplateData, generateCityPageContent, getCityPageStyles } from '@/lib/city-page-template-generator'

export async function POST() {
  try {
    console.log('🔧 Starting comprehensive fix...')

    const results = {
      articles: { count: 0, errors: [] as string[] },
      featured: { count: 0, errors: [] as string[] },
      published: { count: 0, errors: [] as string[] }
    }

    // STEP 1: Ensure all existing articles are published
    console.log('📝 Step 1: Setting all articles to published...')
    const { data: allArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id, city_id, published')
      .not('city_id', 'is', null) // Only city-specific articles

    if (articlesError) {
      console.error('Error fetching articles:', articlesError)
    } else if (allArticles) {
      for (const article of allArticles) {
        if (!article.published) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ published: true })
            .eq('id', article.id)

          if (!updateError) {
            results.published.count++
            console.log(`✅ Published article ${article.id}`)
          } else {
            results.published.errors.push(`Failed to publish article ${article.id}`)
          }
        }
      }
    }

    // STEP 2: Generate articles for all cities
    console.log('📝 Step 2: Generating articles for all cities...')
    
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
      console.error('Error fetching cities:', citiesError)
      results.articles.errors.push('Failed to fetch cities')
    } else if (cities) {
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
        }
      } catch {
        hasCityIdColumn = false
      }

      for (const city of cities as CityRow[]) {
        try {
          const cityName = city.name
          const stateRel = Array.isArray(city.states) ? city.states?.[0] : city.states
          const stateName = stateRel?.name || 'Unknown State'
          const citySlug = toSlug(cityName)
          const stateSlug = toSlug(stateName)
          const slug = stateSlug ? `about-${citySlug}-${stateSlug}` : `about-${citySlug}`

          // Check if article exists
          let existing = null
          if (hasCityIdColumn) {
            const { data: existingData } = await supabase
              .from('articles')
              .select('id')
              .eq('city_id', city.id)
              .single()
            existing = existingData
          }

          if (!existing) {
            // Generate new article
            const templateData = await getCityTemplateData(city.id)
            const content = generateCityPageContent(templateData)
            const styles = getCityPageStyles()
            const fullContent = styles + content
            const title = `Professional ${templateData.NICHE} Services in ${cityName} | ${templateData.SITE_NAME}`

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

            if (!insertError) {
              results.articles.count++
              console.log(`✅ Created article for ${cityName}`)
            } else {
              results.articles.errors.push(`${cityName}: ${insertError.message}`)
            }
          }
        } catch (err) {
          results.articles.errors.push(`${city.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }

    // STEP 3: Fix featured listings (ensure each city has 3 featured)
    console.log('⭐ Step 3: Fixing featured listings...')
    
    const { data: allCities, error: allCitiesError } = await supabase
      .from('cities')
      .select('id, name')

    if (allCitiesError) {
      console.error('Error fetching cities for featured:', allCitiesError)
      results.featured.errors.push('Failed to fetch cities')
    } else if (allCities) {
      for (const city of allCities) {
        try {
          // Get all listings for this city
          const { data: cityListings, error: listingsError } = await supabase
            .from('listings')
            .select('id, featured')
            .eq('city_id', city.id)
            .order('id')

          if (listingsError) {
            results.featured.errors.push(`${city.name}: ${listingsError.message}`)
            continue
          }

          if (!cityListings || cityListings.length === 0) {
            continue // No listings for this city
          }

          const featuredCount = cityListings.filter(l => l.featured).length
          const totalCount = cityListings.length

          if (featuredCount < 3 && totalCount >= 3) {
            // Need to add more featured listings
            const nonFeatured = cityListings.filter(l => !l.featured)
            const toFeature = Math.min(3 - featuredCount, nonFeatured.length)

            for (let i = 0; i < toFeature; i++) {
              const { error: updateError } = await supabase
                .from('listings')
                .update({ featured: true })
                .eq('id', nonFeatured[i].id)

              if (!updateError) {
                results.featured.count++
              } else {
                results.featured.errors.push(`${city.name}: ${updateError.message}`)
              }
            }

            console.log(`✅ Featured ${toFeature} listings for ${city.name}`)
          } else if (totalCount >= 1 && totalCount < 3 && featuredCount === 0) {
            // Feature all available listings
            for (const listing of cityListings) {
              if (!listing.featured) {
                const { error: updateError } = await supabase
                  .from('listings')
                  .update({ featured: true })
                  .eq('id', listing.id)

                if (!updateError) {
                  results.featured.count++
                }
              }
            }

            console.log(`✅ Featured all ${totalCount} listings for ${city.name}`)
          }
        } catch (err) {
          results.featured.errors.push(`${city.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }
    }

    console.log('🎉 Comprehensive fix complete!')
    console.log(`📝 Articles: ${results.articles.count} created`)
    console.log(`📝 Published: ${results.published.count} articles`)
    console.log(`⭐ Featured: ${results.featured.count} listings updated`)

    return NextResponse.json({
      success: true,
      results,
      message: `Fixed ${results.articles.count} articles, published ${results.published.count} articles, and updated ${results.featured.count} featured listings.`
    })

  } catch (error) {
    console.error('❌ Fatal error in comprehensive fix:', error)
    return NextResponse.json(
      { error: 'Failed to run comprehensive fix', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
