import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Fixing featured listings - ensuring all cities have 3 featured listings...')
    
    // Get all cities with their listings
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (name),
        listings (
          id,
          business,
          review_rating,
          number_of_reviews,
          phone,
          website,
          featured
        )
      `)
    
    if (citiesError) {
      console.error('❌ Error fetching cities:', citiesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cities', details: citiesError.message },
        { status: 500 }
      )
    }
    
    if (!cities || cities.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No cities found', results: [] }
      )
    }
    
    console.log(`📊 Found ${cities.length} cities to process`)
    
    let totalUpdated = 0
    const results = []
    
    // Process each city
    for (const city of cities) {
      const listings = city.listings || []
      
      if (listings.length === 0) {
        results.push({
          city: city.name,
          state: (city.states as unknown as { name: string })?.name || 'Unknown',
          listings: 0,
          featured: 0,
          message: 'No listings found'
        })
        continue
      }
      
      // Count current featured listings
      const currentFeatured = listings.filter(l => l.featured).length
      
      if (currentFeatured >= 3) {
        results.push({
          city: city.name,
          state: (city.states as unknown as { name: string })?.name || 'Unknown',
          listings: listings.length,
          featured: currentFeatured,
          message: 'Already has 3+ featured listings'
        })
        continue
      }
      
      // Clear all featured status first
      const { error: clearError } = await supabase
        .from('listings')
        .update({ featured: false })
        .eq('city_id', city.id)
      
      if (clearError) {
        console.error(`❌ Error clearing featured for ${city.name}:`, clearError)
        results.push({
          city: city.name,
          state: (city.states as unknown as { name: string })?.name || 'Unknown',
          listings: listings.length,
          featured: 0,
          message: `Error clearing: ${clearError.message}`
        })
        continue
      }
      
      // Filter listings that have phone or website (better quality)
      const qualityListings = listings.filter(listing => 
        listing.phone && listing.phone.trim() !== '' && 
        listing.website && listing.website.trim() !== ''
      )
      
      // If no quality listings, use all listings
      const candidatesListings = qualityListings.length > 0 ? qualityListings : listings
      
      // Sort by rating and review count (highest first)
      const sortedListings = candidatesListings.sort((a, b) => {
        const ratingDiff = (b.review_rating || 0) - (a.review_rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return (b.number_of_reviews || 0) - (a.number_of_reviews || 0)
      })
      
      // Select up to 3 listings
      const maxFeatured = Math.min(3, sortedListings.length)
      const selectedListings = sortedListings.slice(0, maxFeatured)
      
      if (selectedListings.length > 0) {
        // Update selected listings to featured
        const { error: updateError } = await supabase
          .from('listings')
          .update({ featured: true })
          .in('id', selectedListings.map(l => l.id))
        
        if (updateError) {
          console.error(`❌ Error updating featured for ${city.name}:`, updateError)
          results.push({
            city: city.name,
            state: (city.states as unknown as { name: string })?.name || 'Unknown',
            listings: listings.length,
            featured: 0,
            message: `Error: ${updateError.message}`
          })
        } else {
          totalUpdated += selectedListings.length
          results.push({
            city: city.name,
            state: (city.states as unknown as { name: string })?.name || 'Unknown',
            listings: listings.length,
            featured: selectedListings.length,
            message: `Updated ${selectedListings.length} listings to featured`
          })
        }
      } else {
        results.push({
          city: city.name,
          state: (city.states as unknown as { name: string })?.name || 'Unknown',
          listings: listings.length,
          featured: 0,
          message: 'No suitable listings to feature'
        })
      }
    }
    
    console.log(`✅ Featured listings fix completed. Updated ${totalUpdated} listings.`)
    
    return NextResponse.json({
      success: true,
      message: `Featured listings fix completed. Updated ${totalUpdated} listings.`,
      totalUpdated,
      results
    })
    
  } catch (error) {
    console.error('❌ Error fixing featured listings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix featured listings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
