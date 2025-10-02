'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface State {
  id: string
  name: string
}

interface City {
  id: string
  name: string
  state_id: string
  states: State
}

export default function DebugRoutingPage() {
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch states
        const statesResponse = await fetch('/api/states')
        const statesData = await statesResponse.json()
        setStates(statesData || [])

        // Fetch cities
        const citiesResponse = await fetch('/api/cities')
        const citiesData = await citiesResponse.json()
        setCities(citiesData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Routing</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* States */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">States ({states.length})</h2>
            <div className="space-y-2">
              {states.map((state) => (
                <div key={state.id} className="border p-3 rounded">
                  <p><strong>Name:</strong> {state.name}</p>
                  <p><strong>ID:</strong> {state.id}</p>
                  <div className="mt-2 space-x-2">
                    <Link 
                      href={`/dog-boarding-kennels-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      → State Page (Correct)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Cities ({cities.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cities.map((city) => (
                <div key={city.id} className="border p-3 rounded">
                  <p><strong>Name:</strong> {city.name}</p>
                  <p><strong>State:</strong> {city.states?.name || 'No State'}</p>
                  <p><strong>State ID:</strong> {city.state_id}</p>
                  <div className="mt-2 space-x-2">
                    <Link 
                      href={`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-green-600 hover:underline text-sm"
                    >
                      → City Page (Correct)
                    </Link>
                    <Link 
                      href={`/dog-boarding-kennels-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-purple-600 hover:underline text-sm"
                    >
                      → Niche-City (Redirect)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-2">URL Structure:</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Homepage:</strong> <code>/</code></li>
            <li><strong>State Pages:</strong> <code>/dog-boarding-kennels-{'{state}'}</code> (shows cities)</li>
            <li><strong>City Pages:</strong> <code>/city/{'{city}'}</code> (shows listings)</li>
            <li><strong>Redirects:</strong> <code>/dog-boarding-kennels-{'{city}'}</code> → <code>/city/{'{city}'}</code></li>
          </ul>
        </div>

        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  )
}
