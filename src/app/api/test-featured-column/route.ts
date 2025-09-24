import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if featured column exists by trying to select it
    const { data, error } = await supabase
      .from('listings')
      .select('id, business, featured')
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        suggestion: 'Run this SQL in Supabase: ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;'
      })
    }

    // Check if any listings have featured = true
    const featuredListings = data?.filter(listing => listing.featured === true) || []
    
    return NextResponse.json({
      success: true,
      message: 'Featured column exists and is working!',
      totalListings: data?.length || 0,
      featuredListings: featuredListings.length,
      sampleData: data,
      featuredData: featuredListings
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check your database connection and table structure'
    })
  }
}






