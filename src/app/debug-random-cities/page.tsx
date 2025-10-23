'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function DebugRandomCities() {
  const [cities, setCities] = useState<Array<{id: string; name: string; slug: string; state_id: string; state_name?: string}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRandomCities = async () => {
      try {
        console.log('🔍 Fetching random cities for debugging...')
        
        // First get cities without the join
        const { data: allCities, error: citiesError } = await supabase
          .from('cities')
          .select('id, name, slug, state_id')
          .limit(100) // Get 100 cities to randomize from

        console.log('Cities query result:', { allCities, citiesError })

        if (citiesError) {
          console.error('❌ Error fetching random cities:', citiesError)
          setError(`Cities Error: ${citiesError.message}`)
        } else if (allCities && allCities.length > 0) {
          console.log(`✅ Found ${allCities.length} cities for randomization`)
          
          // Get states separately for better reliability
          const { data: states, error: statesError } = await supabase
            .from('states')
            .select('id, name')
          
          console.log('States query result:', { states, statesError })

          if (statesError) {
            console.error('❌ Error fetching states:', statesError)
            setError(`States Error: ${statesError.message}`)
          } else {
            const stateMap = new Map(states?.map(s => [s.id, s.name]) || [])
            console.log('State map:', stateMap)
            
            // Add state names to cities
            const citiesWithStates = allCities.map(city => ({
              ...city,
              state_name: stateMap.get(city.state_id)
            }))
            
            console.log('Cities with states:', citiesWithStates.slice(0, 5))
            
            // Shuffle and take 10 random cities
            const shuffled = [...citiesWithStates].sort(() => 0.5 - Math.random())
            const randomCities = shuffled.slice(0, 10)
            console.log(`✅ Selected ${randomCities.length} random cities:`, randomCities.map(c => c.name))
            
            setCities(randomCities)
          }
        } else {
          console.log('⚠️ No cities found for randomization')
          setError('No cities found in database')
        }
      } catch (error) {
        console.error('❌ Error fetching random cities:', error)
        setError(`General Error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRandomCities()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading debug info...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug Random Cities</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Random Cities Found: {cities.length}
          </h2>
          
          {cities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cities.map((city) => (
                <div key={city.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{city.name}</h3>
                  <p className="text-sm text-gray-600">ID: {city.id}</p>
                  <p className="text-sm text-gray-600">Slug: {city.slug}</p>
                  <p className="text-sm text-gray-600">State ID: {city.state_id}</p>
                  <p className="text-sm text-gray-600">State Name: {city.state_name || 'Not found'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No cities found</p>
          )}
        </div>

        <div className="mt-6">
          <Link 
            href="/city/central-city" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test Central City Page
          </Link>
        </div>
      </div>
    </div>
  )
}
