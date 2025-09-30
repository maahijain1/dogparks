'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FixAllCitiesPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fixAllCities = async () => {
    setLoading(true)
    setStatus('🔧 FIXING ALL CITIES - This will make city pages work!\n\n')

    try {
      // Step 1: Get all cities
      setStatus(prev => prev + '1. Getting all cities from database...\n')
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')

      if (citiesError) {
        setStatus(prev => prev + `❌ Error: ${citiesError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found ${cities?.length || 0} cities\n\n`)

      // Step 2: Fix all city slugs
      setStatus(prev => prev + '2. Fixing city slugs...\n')
      let fixedSlugs = 0
      for (const city of cities || []) {
        const correctSlug = city.name.toLowerCase().replace(/\s+/g, '-')
        
        if (city.slug !== correctSlug) {
          const { error: updateError } = await supabase
            .from('cities')
            .update({ slug: correctSlug })
            .eq('id', city.id)

          if (updateError) {
            setStatus(prev => prev + `❌ Failed to fix ${city.name}: ${updateError.message}\n`)
          } else {
            setStatus(prev => prev + `✅ Fixed ${city.name}: ${city.slug || 'NO SLUG'} → ${correctSlug}\n`)
            fixedSlugs++
          }
        } else {
          setStatus(prev => prev + `✅ ${city.name} already correct\n`)
        }
      }

      setStatus(prev => prev + `\n🎉 Fixed ${fixedSlugs} city slugs!\n\n`)

      // Step 3: Check listings for each city
      setStatus(prev => prev + '3. Checking listings for each city...\n')
      for (const city of cities || []) {
        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id, business, city_id, featured')
          .eq('city_id', city.id)

        if (listingsError) {
          setStatus(prev => prev + `❌ Error checking ${city.name}: ${listingsError.message}\n`)
        } else {
          const featuredCount = listings?.filter(l => l.featured).length || 0
          setStatus(prev => prev + `✅ ${city.name}: ${listings?.length || 0} listings (${featuredCount} featured)\n`)
        }
      }

      setStatus(prev => prev + `\n🎉 ALL CITIES FIXED! City pages should now work!\n`)
      setStatus(prev => prev + `\nTest these URLs:\n`)
      cities?.forEach(city => {
        const slug = city.name.toLowerCase().replace(/\s+/g, '-')
        setStatus(prev => prev + `- /city/${slug}\n`)
      })

    } catch (error) {
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testSpecificCity = async () => {
    setLoading(true)
    setStatus('🔍 TESTING ALBURY SPECIFICALLY...\n\n')

    try {
      // Test Albury by different methods
      const testMethods = [
        { name: 'By slug "albury"', query: () => supabase.from('cities').select('*').eq('slug', 'albury').single() },
        { name: 'By name "Albury"', query: () => supabase.from('cities').select('*').eq('name', 'Albury').single() },
        { name: 'By partial "albury"', query: () => supabase.from('cities').select('*').ilike('name', '%albury%').single() }
      ]

      for (const method of testMethods) {
        setStatus(prev => prev + `Testing ${method.name}...\n`)
        const { data, error } = await method.query()
        
        if (error || !data) {
          setStatus(prev => prev + `❌ ${method.name}: ${error?.message || 'Not found'}\n`)
        } else {
          setStatus(prev => prev + `✅ ${method.name}: Found "${data.name}" (ID: ${data.id})\n`)
          
          // Check listings for this city
          const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('id, business, featured')
            .eq('city_id', data.id)

          if (listingsError) {
            setStatus(prev => prev + `❌ Error getting listings: ${listingsError.message}\n`)
          } else {
            setStatus(prev => prev + `📋 Listings: ${listings?.length || 0} total, ${listings?.filter(l => l.featured).length || 0} featured\n`)
            listings?.forEach(listing => {
              setStatus(prev => prev + `  - ${listing.business} (Featured: ${listing.featured})\n`)
            })
          }
        }
        setStatus(prev => prev + `\n`)
      }

    } catch (error) {
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 Fix All City Pages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Fix All Cities</h2>
            <p className="text-gray-600 mb-4">
              This will fix ALL city pages by setting correct slugs and checking listings.
            </p>
            <button
              onClick={fixAllCities}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Fixing...' : 'Fix All Cities'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Test Albury</h2>
            <p className="text-gray-600 mb-4">
              This will test Albury specifically and show what&apos;s wrong.
            </p>
            <button
              onClick={testSpecificCity}
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
