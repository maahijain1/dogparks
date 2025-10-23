import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔥 DIRECT ARTICLE FIX - Starting...')
    
    // Step 1: Get ALL cities with their state names
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        slug,
        states!inner (
          id,
          name
        )
      `)
      .order('name')
    
    if (citiesError) {
      console.error('Error fetching cities:', citiesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch cities',
        details: citiesError.message
      }, { status: 500 })
    }
    
    if (!cities || cities.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No cities found in database'
      }, { status: 404 })
    }
    
    console.log(`✅ Found ${cities.length} cities`)
    
    //Step 2: Get site settings for niche
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['niche', 'site_name'])
    
    const niche = settings?.find(s => s.setting_key === 'niche')?.setting_value || 'Dog Boarding'
    const siteName = settings?.find(s => s.setting_key === 'site_name')?.setting_value || 'Professional Services'
    
    console.log(`✅ Using niche: ${niche}`)
    
    let created = 0
    let updated = 0
    let errors = 0
    
    // Step 3: Process each city
    for (const city of cities) {
      try {
        const cityName = city.name
        const stateData = Array.isArray(city.states) ? city.states[0] : city.states
        const stateName = stateData?.name || 'Unknown'
        
        const title = `Quality ${niche} in ${cityName}, ${stateName}`
        const slug = `about-${cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        
        // Simple, clean content
        const content = `
          <h2>Welcome to ${cityName}, ${stateName}</h2>
          <p>Looking for trusted ${niche.toLowerCase()} services in ${cityName}? ${siteName} connects you with the best facilities in ${cityName} and throughout ${stateName}.</p>
          
          <h3>${niche} Services in ${cityName}</h3>
          <p>Whether you're planning a trip or need care for your pet, ${cityName} offers several quality options. Professional facilities in the area provide safe, comfortable environments.</p>
          
          <h3>What to Look For</h3>
          <ul>
            <li>Clean and safe environment</li>
            <li>Qualified, caring staff</li>
            <li>Regular exercise and play areas</li>
            <li>Individualized care for each pet</li>
            <li>Emergency veterinary access</li>
          </ul>
          
          <h3>Find the Best ${niche} in ${cityName}</h3>
          <p>${siteName} helps pet owners in ${cityName} find reputable facilities. Browse our listings above to compare facilities and find the perfect fit for your pet.</p>
        `
        
        // Check if article exists
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('city_id', city.id)
          .maybeSingle()
        
        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              title,
              slug,
              content,
              published: true
            })
            .eq('id', existing.id)
          
          if (updateError) {
            console.error(`❌ Error updating article for ${cityName}:`, updateError)
            errors++
          } else {
            updated++
          }
        } else {
          // Create new
          const { error: insertError } = await supabase
            .from('articles')
            .insert({
              title,
              slug,
              content,
              city_id: city.id,
              published: true,
              created_at: new Date().toISOString()
            })
          
          if (insertError) {
            console.error(`❌ Error creating article for ${cityName}:`, insertError)
            errors++
          } else {
            created++
          }
        }
        
        // Log progress every 100 cities
        if ((created + updated) % 100 === 0) {
          console.log(`📝 Progress: ${created + updated}/${cities.length} cities processed`)
        }
        
      } catch (err) {
        console.error(`❌ Error processing city ${city.name}:`, err)
        errors++
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Articles fixed: ${created} created, ${updated} updated`,
      stats: {
        totalCities: cities.length,
        created,
        updated,
        errors
      }
    })
    
  } catch (error) {
    console.error('❌ DIRECT ARTICLE FIX ERROR:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix articles',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

