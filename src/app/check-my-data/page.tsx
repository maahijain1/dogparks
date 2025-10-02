'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CheckMyDataPage() {
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
        // Get states
        const statesRes = await fetch('/api/states')
        const statesData = await statesRes.json()
        setStates(statesData || [])

        // Get cities  
        const citiesRes = await fetch('/api/cities')
        const citiesData = await citiesRes.json()
        setCities(citiesData || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading your data...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">🚨 YOUR ACTUAL DATA</h1>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-red-800 mb-4">URL STRUCTURE EXPLANATION:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>❌ WRONG:</strong> <code>/city/alabama</code> (This looks for a CITY named Alabama)</p>
            <p><strong>✅ CORRECT:</strong> <code>/dog-boarding-kennels-alabama</code> (This shows STATE page with cities)</p>
            <p><strong>✅ CITY EXAMPLE:</strong> <code>/dog-boarding-kennels-birmingham</code> (This shows CITY page with listings)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* States */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Your States ({states.length})</h2>
            {states.length === 0 ? (
              <p className="text-red-600">❌ NO STATES FOUND! You need to create states first.</p>
            ) : (
              <div className="space-y-3">
                {states.map((state) => (
                  <div key={state.id} className="border p-3 rounded">
                    <p><strong>{state.name}</strong></p>
                    <div className="mt-2">
                      <Link 
                        href={`/dog-boarding-kennels-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-600 hover:underline text-sm bg-blue-50 px-2 py-1 rounded"
                        target="_blank"
                      >
                        ✅ CORRECT URL: /dog-boarding-kennels-{state.name.toLowerCase().replace(/\s+/g, '-')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cities */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Your Cities ({cities.length})</h2>
            {cities.length === 0 ? (
              <p className="text-red-600">❌ NO CITIES FOUND! You need to create cities under states.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cities.map((city) => (
                  <div key={city.id} className="border p-2 rounded text-sm">
                    <p><strong>{city.name}</strong> → {city.states?.name || 'No State Linked!'}</p>
                    {city.states?.name ? (
                      <div className="mt-1">
                        <Link 
                          href={`/dog-boarding-kennels-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-green-600 hover:underline text-xs bg-green-50 px-1 py-0.5 rounded"
                          target="_blank"
                        >
                          City URL: /dog-boarding-kennels-{city.name.toLowerCase().replace(/\s+/g, '-')}
                        </Link>
                      </div>
                    ) : (
                      <p className="text-red-600 text-xs">⚠️ City not linked to any state!</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">🎯 WHAT TO DO NEXT:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Stop using</strong> <code>/city/alabama</code> - this is wrong!</li>
            <li><strong>Use the correct URLs</strong> shown above in blue/green boxes</li>
            <li><strong>If no states/cities show</strong>, go to admin panel and create them</li>
            <li><strong>Test the correct URLs</strong> by clicking the links above</li>
          </ol>
        </div>

        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  )
}
