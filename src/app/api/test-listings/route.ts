import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { error } = await supabase
      .from('listings')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        suggestion: 'Check your database connection and table structure'
      })
    }

    // Test getting cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name, states(id, name)')
      .limit(5)

    return NextResponse.json({
      success: true,
      message: 'Database connection is working!',
      cities: cities || [],
      citiesError: citiesError?.message || null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST() {
  try {
    // Test creating a simple listing
    const testData = {
      business: 'Test Business',
      category: 'Test Category',
      review_rating: 0,
      number_of_reviews: 0,
      address: 'Test Address',
      website: '',
      phone: '',
      email: '',
      city_id: 'test-city-id', // This will likely fail, but we'll see the error
      featured: false
    }

    const { data, error } = await supabase
      .from('listings')
      .insert([testData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        testData: testData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test listing created successfully!',
      data: data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}






