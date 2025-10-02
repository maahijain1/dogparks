import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { states } = await request.json()

    if (!states || !Array.isArray(states) || states.length === 0) {
      return NextResponse.json(
        { error: 'States array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each state name
    const validStates = states
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map(name => ({ name }))

    if (validStates.length === 0) {
      return NextResponse.json(
        { error: 'No valid state names provided' },
        { status: 400 }
      )
    }

    console.log('Creating bulk states:', validStates)

    // Insert all states at once
    const { data, error } = await supabase
      .from('states')
      .insert(validStates)
      .select()

    if (error) {
      console.error('Bulk states creation error:', error)
      throw error
    }

    console.log('Successfully created states:', data?.length)

    return NextResponse.json({
      success: true,
      created: data?.length || 0,
      states: data
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error creating bulk states:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create states',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
