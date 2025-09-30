'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAlburyPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const debugAlbury = async () => {
    setLoading(true)
    setStatus('Debugging Albury city and listings...\n')

    try {
      // 1. Check all cities to see how Albury is stored
      setStatus('1. Checking all cities in database...\n')
      const { data: allCities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug, states(name)')
        .order('name')

      if (citiesError) {
        setStatus(prev => prev + `❌ Error fetching cities: ${citiesError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found ${allCities?.length || 0} cities:\n`)
      allCities?.forEach(city => {
        setStatus(prev => prev + `- ${city.name} (slug: ${city.slug || 'NO SLUG'}) in ${(city.states as { name?: string })?.name || 'Unknown'}\n`)
      })

      // 2. Look specifically for Albury
      setStatus(prev => prev + `\n2. Looking for Albury specifically...\n`)
      const alburyCities = allCities?.filter(city => 
        city.name.toLowerCase().includes('albury')
      )

      if (alburyCities && alburyCities.length > 0) {
        setStatus(prev => prev + `✅ Found Albury cities:\n`)
        alburyCities.forEach(city => {
          setStatus(prev => prev + `- ${city.name} (ID: ${city.id}, slug: ${city.slug || 'NO SLUG'})\n`)
        })

        // 3. Check listings for each Albury city
        for (const city of alburyCities) {
          setStatus(prev => prev + `\n3. Checking listings for ${city.name} (ID: ${city.id})...\n`)
          
          const { data: listings, error: listingsError } = await supabase
            .from('listings')
            .select('id, business, city_id, featured')
            .eq('city_id', city.id)

          if (listingsError) {
            setStatus(prev => prev + `❌ Error fetching listings: ${listingsError.message}\n`)
          } else {
            setStatus(prev => prev + `✅ Found ${listings?.length || 0} listings:\n`)
            listings?.forEach(listing => {
              setStatus(prev => prev + `  - ${listing.business} (Featured: ${listing.featured})\n`)
            })
          }
        }
      } else {
        setStatus(prev => prev + `❌ No cities found containing 'albury'\n`)
      }

      // 4. Check what the URL slug should be
      setStatus(prev => prev + `\n4. URL slug analysis...\n`)
      setStatus(prev => prev + `Expected URL: /city/albury\n`)
      setStatus(prev => prev + `Expected slug: 'albury'\n`)
      
      // 5. Test different slug variations
      const slugVariations = ['albury', 'Albury', 'ALBURY']
      for (const slug of slugVariations) {
        setStatus(prev => prev + `\nTesting slug: '${slug}'\n`)
        
        const { data: cityBySlug } = await supabase
          .from('cities')
          .select('id, name, slug')
          .eq('slug', slug)
          .single()

        if (cityBySlug) {
          setStatus(prev => prev + `✅ Found city by slug '${slug}': ${cityBySlug.name}\n`)
        } else {
          setStatus(prev => prev + `❌ No city found with slug '${slug}'\n`)
        }
      }

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fixAlburySlug = async () => {
    setLoading(true)
    setStatus('Fixing Albury slug...\n')

    try {
      // Find Albury city
      const { data: alburyCity, error: findError } = await supabase
        .from('cities')
        .select('id, name')
        .ilike('name', '%albury%')
        .single()

      if (findError || !alburyCity) {
        setStatus(prev => prev + `❌ Could not find Albury city: ${findError?.message}\n`)
        return
      }

      setStatus(prev => prev + `Found Albury: ${alburyCity.name} (ID: ${alburyCity.id})\n`)

      // Update the slug
      const { error: updateError } = await supabase
        .from('cities')
        .update({ slug: 'albury' })
        .eq('id', alburyCity.id)

      if (updateError) {
        setStatus(prev => prev + `❌ Error updating slug: ${updateError.message}\n`)
      } else {
        setStatus(prev => prev + `✅ Successfully updated Albury slug to 'albury'\n`)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Albury City</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Albury</h2>
            <p className="text-gray-600 mb-4">
              This will check how Albury is stored in the database and why listings aren&apos;t showing.
            </p>
            <button
              onClick={debugAlbury}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Debugging...' : 'Debug Albury'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Fix Albury Slug</h2>
            <p className="text-gray-600 mb-4">
              This will set the Albury city slug to &apos;albury&apos; so the URL works.
            </p>
            <button
              onClick={fixAlburySlug}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Fixing...' : 'Fix Slug'}
            </button>
          </div>
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
