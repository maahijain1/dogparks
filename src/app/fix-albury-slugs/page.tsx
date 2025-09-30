'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FixAlburySlugsPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fixAllCitySlugs = async () => {
    setLoading(true)
    setStatus('Fixing all city slugs...\n')

    try {
      // Get all cities
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug')

      if (citiesError) {
        setStatus(prev => prev + `❌ Error fetching cities: ${citiesError.message}\n`)
        return
      }

      setStatus(prev => prev + `Found ${cities?.length || 0} cities\n`)

      let fixedCount = 0
      for (const city of cities || []) {
        const expectedSlug = city.name.toLowerCase().replace(/\s+/g, '-')
        
        if (city.slug !== expectedSlug) {
          setStatus(prev => prev + `Fixing ${city.name}: ${city.slug || 'NO SLUG'} → ${expectedSlug}\n`)
          
          const { error: updateError } = await supabase
            .from('cities')
            .update({ slug: expectedSlug })
            .eq('id', city.id)

          if (updateError) {
            setStatus(prev => prev + `❌ Error updating ${city.name}: ${updateError.message}\n`)
          } else {
            setStatus(prev => prev + `✅ Fixed ${city.name}\n`)
            fixedCount++
          }
        } else {
          setStatus(prev => prev + `✅ ${city.name} already has correct slug\n`)
        }
      }

      setStatus(prev => prev + `\n🎉 Fixed ${fixedCount} cities!\n`)

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testAlbury = async () => {
    setLoading(true)
    setStatus('Testing Albury specifically...\n')

    try {
      // Test the city lookup
      const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .eq('slug', 'albury')
        .single()

      if (cityError || !city) {
        setStatus(prev => prev + `❌ City not found by slug 'albury': ${cityError?.message}\n`)
        
        // Try by name
        const { data: cityByName, error: nameError } = await supabase
          .from('cities')
          .select('id, name, slug, states(name)')
          .ilike('name', '%albury%')
          .single()

        if (nameError || !cityByName) {
          setStatus(prev => prev + `❌ City not found by name either: ${nameError?.message}\n`)
        } else {
          setStatus(prev => prev + `✅ Found by name: ${cityByName.name} (slug: ${cityByName.slug || 'NO SLUG'})\n`)
        }
      } else {
        setStatus(prev => prev + `✅ Found by slug: ${city.name} (ID: ${city.id})\n`)
        
        // Test listings
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id, business, city_id, featured')
          .eq('city_id', city.id)

        if (listingsError) {
          setStatus(prev => prev + `❌ Error fetching listings: ${listingsError.message}\n`)
        } else {
          setStatus(prev => prev + `✅ Found ${listings?.length || 0} listings for Albury:\n`)
          listings?.forEach(listing => {
            setStatus(prev => prev + `  - ${listing.business} (Featured: ${listing.featured})\n`)
          })
        }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fix City Slugs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Fix All City Slugs</h2>
            <p className="text-gray-600 mb-4">
              This will set the correct slug for all cities based on their names.
            </p>
            <button
              onClick={fixAllCitySlugs}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Fixing...' : 'Fix All Slugs'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Albury</h2>
            <p className="text-gray-600 mb-4">
              This will test if Albury can be found and show its listings.
            </p>
            <button
              onClick={testAlbury}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Albury'}
            </button>
          </div>
        </div>

        {status && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Results:</h3>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
