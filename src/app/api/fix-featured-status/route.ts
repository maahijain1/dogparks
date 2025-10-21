import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Fixing featured status - clearing all featured listings first...')
    
    // First, clear all featured status
    const { error: clearError } = await supabase
      .from('listings')
      .update({ featured: false })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all rows
    
    if (clearError) {
      console.error('❌ Error clearing featured status:', clearError)
      return NextResponse.json(
        { success: false, error: 'Failed to clear featured status', details: clearError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Cleared all featured status')
    
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
          website
        )
      `)
    
    if (citiesError) {
      console.error('❌ Error fetching cities:', citiesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch cities', details: citiesError.message },
        { status: 500 }
      )
    }
    
    console.log(`📊 Found ${cities?.length || 0} cities`)
    
    let totalUpdated = 0
    const results = []
    
    // Process each city
    for (const city of cities || []) {
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
      
      // Select up to 3 random listings from the top candidates
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
            message: `Selected ${selectedListings.length} featured listings`
          })
          console.log(`✅ ${city.name}: Selected ${selectedListings.length} featured listings`)
        }
      } else {
        results.push({
          city: city.name,
          state: (city.states as unknown as { name: string })?.name || 'Unknown',
          listings: listings.length,
          featured: 0,
          message: 'No suitable listings for featuring'
        })
      }
    }
    
    console.log(`🎉 Featured status fix completed! Updated ${totalUpdated} listings`)
    
    return NextResponse.json({
      success: true,
      message: `Featured status fixed successfully! Updated ${totalUpdated} listings across ${cities?.length || 0} cities`,
      totalUpdated,
      totalCities: cities?.length || 0,
      results: results.slice(0, 10) // Show first 10 results
    })
    
  } catch (error) {
    console.error('❌ Featured status fix failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Featured status fix failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
