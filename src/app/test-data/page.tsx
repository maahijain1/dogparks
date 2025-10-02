'use client'

import { useState, useEffect } from 'react'

interface State {
  id: string
  name: string
}

interface City {
  id: string
  name: string
  state_id: string
  states?: State
}

export default function TestDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/check-data')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error:', error)
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
        <h1 className="text-3xl font-bold mb-8">Database Test</h1>
        
        {data && (
          <div className="space-y-8">
            {/* States */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">States ({data.statesCount})</h2>
              <div className="grid gap-2">
                {data.states?.map((state: State) => (
                  <div key={state.id} className="p-3 border rounded">
                    <strong>{state.name}</strong> (ID: {state.id})
                  </div>
                ))}
              </div>
            </div>

            {/* Cities by State */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Cities by State</h2>
              {Object.entries(data.citiesByState || {}).map(([stateName, cities]) => (
                <div key={stateName} className="mb-4 p-3 border rounded">
                  <h3 className="font-bold text-lg">{stateName}</h3>
                  <div className="mt-2 text-sm">
                    {Array.isArray(cities) ? cities.join(', ') : 'No cities'}
                  </div>
                </div>
              ))}
            </div>

            {/* All Cities */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">All Cities ({data.citiesCount})</h2>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {data.cities?.map((city: City) => (
                  <div key={city.id} className="p-2 border rounded text-sm">
                    <strong>{city.name}</strong> → {city.states?.name || 'No State'} (state_id: {city.state_id})
                  </div>
                ))}
              </div>
            </div>

            {/* Test URLs */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h2 className="text-xl font-bold mb-4">Test URLs</h2>
              <div className="space-y-2">
                {data.states?.slice(0, 3).map((state: State) => (
                  <div key={state.id}>
                    <a 
                      href={`/dog-boarding-kennels-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      State: {state.name} → /dog-boarding-kennels-{state.name.toLowerCase().replace(/\s+/g, '-')}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
