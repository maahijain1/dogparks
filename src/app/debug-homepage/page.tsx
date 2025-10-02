'use client'

import { useState, useEffect } from 'react'

export default function DebugHomepage() {
  interface StateType {
    id: string
    name: string
  }
  
  interface CityType {
    id: string
    name: string
    states?: {
      name: string
    }
  }

  const [states, setStates] = useState<StateType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== FETCHING DATA ===')
        
        const statesRes = await fetch('/api/states')
        const statesData = await statesRes.json()
        console.log('States response:', statesData)
        setStates(statesData || [])

        const citiesRes = await fetch('/api/cities')
        const citiesData = await citiesRes.json()
        console.log('Cities response:', citiesData)
        setCities(citiesData || [])
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Homepage Debug</h1>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-4">🚨 ISSUE:</h2>
          <p>Homepage state links are going to <code>/city/alabama</code> instead of <code>/dog-boarding-kennels-alabama</code></p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">States Data ({states.length})</h2>
            {states.length === 0 ? (
              <p className="text-red-600">❌ NO STATES LOADED!</p>
            ) : (
              <div className="space-y-2">
                {states.map((state, index: number) => (
                  <div key={index} className="p-2 border rounded">
                    <p><strong>Name:</strong> {state.name}</p>
                    <p><strong>ID:</strong> {state.id}</p>
                    <p><strong>Should link to:</strong> <code>/dog-boarding-kennels-{state.name?.toLowerCase().replace(/\s+/g, '-')}</code></p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Cities Data ({cities.length})</h2>
            {cities.length === 0 ? (
              <p className="text-red-600">❌ NO CITIES LOADED!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cities.slice(0, 10).map((city, index: number) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <p><strong>Name:</strong> {city.name}</p>
                    <p><strong>State:</strong> {city.states?.name || 'No State'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">🔍 DEBUGGING STEPS:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Check if states are loading properly above</li>
            <li>If no states, create them in admin panel</li>
            <li>If states exist but homepage still wrong, there&apos;s another link section</li>
            <li>Check browser console for state link generation logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
