'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EmergencyFixPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const emergencyFix = async () => {
    setLoading(true)
    setStatus('🚨 EMERGENCY FIX - Making city pages work NOW!\n\n')

    try {
      // Step 1: Check what's in the database
      setStatus(prev => prev + '1. Checking database...\n')
      
      // Get all cities
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .order('name')

      if (citiesError) {
        setStatus(prev => prev + `❌ Cities error: ${citiesError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found ${cities?.length || 0} cities\n`)

      // Get all listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, city_id, featured, cities(name)')
        .order('business')

      if (listingsError) {
        setStatus(prev => prev + `❌ Listings error: ${listingsError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found ${listings?.length || 0} listings\n\n`)

      // Step 2: Show what we have
      setStatus(prev => prev + '2. Current data:\n')
      cities?.forEach(city => {
        const cityListings = listings?.filter(l => l.city_id === city.id) || []
        setStatus(prev => prev + `- ${city.name} (ID: ${city.id}, slug: ${city.slug || 'NO SLUG'}): ${cityListings.length} listings\n`)
      })

      setStatus(prev => prev + '\n3. Fixing city slugs...\n')

      // Step 3: Fix all city slugs
      let fixedCount = 0
      for (const city of cities || []) {
        const correctSlug = city.name.toLowerCase().replace(/\s+/g, '-')
        
        if (city.slug !== correctSlug) {
          const { error: updateError } = await supabase
            .from('cities')
            .update({ slug: correctSlug })
            .eq('id', city.id)

          if (updateError) {
            setStatus(prev => prev + `❌ Failed ${city.name}: ${updateError.message}\n`)
          } else {
            setStatus(prev => prev + `✅ Fixed ${city.name}: ${city.slug || 'NO SLUG'} → ${correctSlug}\n`)
            fixedCount++
          }
        }
      }

      setStatus(prev => prev + `\n🎉 Fixed ${fixedCount} city slugs!\n\n`)

      // Step 4: Test Albury specifically
      setStatus(prev => prev + '4. Testing Albury...\n')
      
      // Try to find Albury
      const { data: albury, error: alburyError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .or('name.eq.Albury,slug.eq.albury,name.ilike.%albury%')
        .single()

      if (alburyError || !albury) {
        setStatus(prev => prev + `❌ Albury not found: ${alburyError?.message}\n`)
      } else {
        setStatus(prev => prev + `✅ Found Albury: ${albury.name} (ID: ${albury.id})\n`)
        
        // Get Albury listings
        const { data: alburyListings, error: alburyListingsError } = await supabase
          .from('listings')
          .select('id, business, featured, city_id')
          .eq('city_id', albury.id)

        if (alburyListingsError) {
          setStatus(prev => prev + `❌ Error getting Albury listings: ${alburyListingsError.message}\n`)
        } else {
          setStatus(prev => prev + `✅ Albury has ${alburyListings?.length || 0} listings:\n`)
          alburyListings?.forEach(listing => {
            setStatus(prev => prev + `  - ${listing.business} (Featured: ${listing.featured})\n`)
          })
        }
      }

      setStatus(prev => prev + `\n🎉 EMERGENCY FIX COMPLETE!\n`)
      setStatus(prev => prev + `Now test: /city/albury\n`)

    } catch (error) {
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testCityPage = async () => {
    setLoading(true)
    setStatus('🔍 Testing city page lookup...\n\n')

    try {
      // Simulate what the city page does
      const slug = 'albury'
      const cityName = 'Albury'

      setStatus(prev => prev + `Testing slug: ${slug}\n`)
      setStatus(prev => prev + `Testing city name: ${cityName}\n\n`)

      // Method 1: By slug
      setStatus(prev => prev + 'Method 1: By slug...\n')
      const { data: bySlug, error: slugError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .eq('slug', slug)
        .single()

      if (slugError || !bySlug) {
        setStatus(prev => prev + `❌ By slug failed: ${slugError?.message}\n`)
      } else {
        setStatus(prev => prev + `✅ By slug success: ${bySlug.name}\n`)
      }

      // Method 2: By name
      setStatus(prev => prev + '\nMethod 2: By name...\n')
      const { data: byName, error: nameError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .eq('name', cityName)
        .single()

      if (nameError || !byName) {
        setStatus(prev => prev + `❌ By name failed: ${nameError?.message}\n`)
      } else {
        setStatus(prev => prev + `✅ By name success: ${byName.name}\n`)
      }

      // Method 3: By partial
      setStatus(prev => prev + '\nMethod 3: By partial...\n')
      const { data: byPartial, error: partialError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .ilike('name', `%${cityName}%`)
        .single()

      if (partialError || !byPartial) {
        setStatus(prev => prev + `❌ By partial failed: ${partialError?.message}\n`)
      } else {
        setStatus(prev => prev + `✅ By partial success: ${byPartial.name}\n`)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚨 Emergency Fix</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🚨 Emergency Fix</h2>
            <p className="text-gray-600 mb-4">
              This will fix ALL city pages and show you exactly what&apos;s wrong.
            </p>
            <button
              onClick={emergencyFix}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Fixing...' : 'Emergency Fix'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Test City Lookup</h2>
            <p className="text-gray-600 mb-4">
              This will test how the city page finds cities.
            </p>
            <button
              onClick={testCityPage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Lookup'}
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
