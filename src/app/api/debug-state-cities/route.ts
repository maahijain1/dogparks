import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stateSlug = searchParams.get('state')
    
    console.log('=== DEBUG STATE CITIES ===')
    console.log('State slug:', stateSlug)
    
    // Get all states
    const { data: allStates, error: statesError } = await supabase
      .from('states')
      .select('*')
      .order('name')

    if (statesError) {
      console.error('States error:', statesError)
      return NextResponse.json({ error: statesError.message }, { status: 500 })
    }

    console.log('All states:', allStates?.map(s => ({ id: s.id, name: s.name })))

    // If specific state requested, get its cities
    let stateData = null
    let cities = []
    
    if (stateSlug) {
      // Try to find state by name (case-insensitive)
      const stateName = stateSlug.replace(/\b\w/g, l => l.toUpperCase())
      
      stateData = allStates?.find(state => 
        state.name.toLowerCase() === stateName.toLowerCase()
      )
      
      console.log('Looking for state:', stateName)
      console.log('Found state:', stateData)
      
      if (stateData) {
        // Get cities for this state
        const { data: stateCities, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .eq('state_id', stateData.id)
          .order('name')

        if (citiesError) {
          console.error('Cities error:', citiesError)
        } else {
          cities = stateCities || []
          console.log('Cities in state:', cities.map(c => ({ id: c.id, name: c.name, state_id: c.state_id })))
        }
      }
    }

    // Also get all cities with their states
    const { data: allCities, error: allCitiesError } = await supabase
      .from('cities')
      .select(`
        *,
        states (
          id,
          name
        )
      `)
      .order('name')

    if (allCitiesError) {
      console.error('All cities error:', allCitiesError)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      requestedState: stateSlug,
      foundState: stateData,
      citiesInState: cities,
      citiesCount: cities.length,
      allStates: allStates || [],
      allStatesCount: allStates?.length || 0,
      allCities: allCities || [],
      allCitiesCount: allCities?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
