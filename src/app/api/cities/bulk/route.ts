import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { cities, state_id } = await request.json()

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json(
        { error: 'Cities array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!state_id) {
      return NextResponse.json(
        { error: 'State ID is required for bulk city creation' },
        { status: 400 }
      )
    }

    // Validate state exists
    const { data: stateExists, error: stateError } = await supabase
      .from('states')
      .select('id, name')
      .eq('id', state_id)
      .single()

    if (stateError || !stateExists) {
      return NextResponse.json(
        { error: 'Invalid state ID provided' },
        { status: 400 }
      )
    }

    // Validate each city name
    const validCities = cities
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => ({ name, state_id }))

    if (validCities.length === 0) {
      return NextResponse.json(
        { error: 'No valid city names provided' },
        { status: 400 }
      )
    }

    console.log('Creating bulk cities for state:', stateExists.name)
    console.log('Cities to create:', validCities.length)

    // Insert all cities at once
    const { data, error } = await supabase
      .from('cities')
      .insert(validCities)
      .select(`
        *,
        states (
          id,
          name
        )
      `)

    if (error) {
      console.error('Bulk cities creation error:', error)
      throw error
    }

    console.log('Successfully created cities:', data?.length)

    return NextResponse.json({
      success: true,
      created: data?.length || 0,
      state: stateExists,
      cities: data
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error creating bulk cities:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create cities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
