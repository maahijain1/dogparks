import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing featured column...')
    
    // Test 1: Check if featured column exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'listings')
      .eq('column_name', 'featured')

    if (columnError) {
      return NextResponse.json({
        success: false,
        error: 'Error checking columns',
        details: columnError.message
      })
    }

    if (!columns || columns.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Featured column does not exist',
        message: 'You need to add the featured column to your database',
        sql: 'ALTER TABLE listings ADD COLUMN featured BOOLEAN DEFAULT FALSE;'
      })
    }

    // Test 2: Get a sample listing to test with
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, business, featured')
      .limit(1)

    if (listingsError) {
      return NextResponse.json({
        success: false,
        error: 'Error fetching listings',
        details: listingsError.message
      })
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No listings found to test with'
      })
    }

    const testListing = listings[0]
    console.log('Testing with listing:', testListing)

    // Test 3: Try to update the featured status
    const newFeaturedStatus = !testListing.featured
    console.log(`Changing featured from ${testListing.featured} to ${newFeaturedStatus}`)

    const { data: updateResult, error: updateError } = await supabase
      .from('listings')
      .update({ featured: newFeaturedStatus })
      .eq('id', testListing.id)
      .select('id, business, featured')
      .single()

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: 'Update failed',
        details: updateError.message,
        columnInfo: columns[0]
      })
    }

    // Revert the change
    await supabase
      .from('listings')
      .update({ featured: testListing.featured })
      .eq('id', testListing.id)

    return NextResponse.json({
      success: true,
      message: 'Featured column is working correctly',
      columnInfo: columns[0],
      testResult: {
        original: testListing.featured,
        updated: updateResult.featured,
        reverted: testListing.featured
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}