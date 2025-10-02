import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all states
    const { data: states, error: statesError } = await supabase
      .from('states')
      .select('*')
      .order('name')

    // Get all cities with their states
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select(`
        *,
        states (
          id,
          name
        )
      `)
      .order('name')

    return NextResponse.json({
      success: true,
      states: states || [],
      statesCount: states?.length || 0,
      cities: cities || [],
      citiesCount: cities?.length || 0,
      statesList: states?.map(s => s.name) || [],
      citiesByState: cities?.reduce((acc, city) => {
        const stateName = city.states?.name || 'No State'
        if (!acc[stateName]) acc[stateName] = []
        acc[stateName].push(city.name)
        return acc
      }, {} as Record<string, string[]>) || {}
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
