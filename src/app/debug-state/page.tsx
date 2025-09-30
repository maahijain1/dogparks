'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugStatePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const debugStateLookup = async () => {
    setLoading(true)
    setStatus('Debugging state lookup...')

    try {
      // Test the problematic URL
      const testSlug = 'boarding-kennels-new-south-wales-(nsw)'
      setStatus(`Testing URL: ${testSlug}\n`)

      // Get current niche setting
      const { data: nicheData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'niche')
        .single()

      const currentNiche = nicheData?.setting_value || 'Dog Park'
      setStatus(prev => prev + `Current niche setting: ${currentNiche}\n`)

      // Parse the URL like the actual code does
      const parts = testSlug.split('-')
      const nicheSlug = currentNiche.toLowerCase().replace(/\s+/g, '-')
      const nicheParts = nicheSlug.split('-')
      
      setStatus(prev => prev + `URL parts: ${JSON.stringify(parts)}\n`)
      setStatus(prev => prev + `Niche slug: ${nicheSlug}\n`)
      setStatus(prev => prev + `Niche parts: ${JSON.stringify(nicheParts)}\n`)

      // Check if this matches the state page pattern
      const isStatePage = testSlug.includes('-') && parts.length >= 3 && 
        parts.slice(0, nicheParts.length).join('-') === nicheSlug

      setStatus(prev => prev + `Is state page: ${isStatePage}\n`)

      if (isStatePage) {
        const stateName = parts.slice(nicheParts.length).join('-').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        setStatus(prev => prev + `Parsed state name: "${stateName}"\n`)

        // Try to find this state
        const { data: stateData, error: stateError } = await supabase
          .from('states')
          .select('id, name')
          .eq('name', stateName)
          .single()

        if (stateError || !stateData) {
          setStatus(prev => prev + `❌ State not found with exact name: "${stateName}"\n`)
          setStatus(prev => prev + `Error: ${stateError?.message}\n`)

          // Try case-insensitive search
          const { data: stateDataCI } = await supabase
            .from('states')
            .select('id, name')
            .ilike('name', `%${stateName}%`)
            .limit(5)

          if (stateDataCI && stateDataCI.length > 0) {
            setStatus(prev => prev + `Found similar states (case-insensitive):\n`)
            stateDataCI.forEach(state => {
              setStatus(prev => prev + `- "${state.name}"\n`)
            })
          } else {
            setStatus(prev => prev + `No similar states found\n`)
          }
        } else {
          setStatus(prev => prev + `✅ Found state: "${stateData.name}" (ID: ${stateData.id})\n`)
        }
      }

      // Show all states in database
      const { data: allStates, error: allStatesError } = await supabase
        .from('states')
        .select('id, name')
        .order('name')

      if (allStatesError) {
        setStatus(prev => prev + `Error fetching all states: ${allStatesError.message}\n`)
      } else {
        setStatus(prev => prev + `\nAll states in database:\n`)
        allStates?.forEach(state => {
          setStatus(prev => prev + `- "${state.name}"\n`)
        })
      }

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug State Lookup</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test State URL Parsing</h2>
          <p className="text-gray-600 mb-4">
            This will debug why the URL &quot;boarding-kennels-new-south-wales-(nsw)&quot; is not working.
          </p>
          <button
            onClick={debugStateLookup}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Debugging...' : 'Debug State Lookup'}
          </button>
        </div>

        {status && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Debug Results:</h3>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
