'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FixDatabasePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const checkAndFixDatabase = async () => {
    setLoading(true)
    setStatus('Checking database schema...')

    try {
      // Check if featured column exists
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'listings')
        .eq('column_name', 'featured')

      if (columnError) {
        setStatus('Error checking columns: ' + columnError.message)
        return
      }

      if (columns && columns.length === 0) {
        setStatus('Featured column does not exist. Adding it now...')
        
        // Add the featured column
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;'
        })

        if (alterError) {
          setStatus('Error adding featured column: ' + alterError.message)
          return
        }

        setStatus('✅ Featured column added successfully!')
      } else {
        setStatus('✅ Featured column already exists!')
      }

      // Check listings data
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, featured, cities(name)')
        .limit(5)

      if (listingsError) {
        setStatus('Error fetching listings: ' + listingsError.message)
        return
      }

      setStatus(prev => prev + `\n\nFound ${listings?.length || 0} listings. Sample data:`)
      listings?.forEach(listing => {
        setStatus(prev => prev + `\n- ${listing.business} (Featured: ${listing.featured}) in ${listing.cities?.name}`)
      })

      // Check cities data
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, states(name)')
        .limit(5)

      if (citiesError) {
        setStatus('Error fetching cities: ' + citiesError.message)
        return
      }

      setStatus(prev => prev + `\n\nFound ${cities?.length || 0} cities. Sample data:`)
      cities?.forEach(city => {
        setStatus(prev => prev + `\n- ${city.name}, ${city.states?.name}`)
      })

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testFeaturedToggle = async () => {
    setLoading(true)
    setStatus('Testing featured toggle...')

    try {
      // Get first listing
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, featured')
        .limit(1)

      if (listingsError || !listings || listings.length === 0) {
        setStatus('No listings found to test with')
        return
      }

      const listing = listings[0]
      const newFeaturedStatus = !listing.featured

      setStatus(`Testing toggle for ${listing.business} from ${listing.featured} to ${newFeaturedStatus}...`)

      const { data, error } = await supabase
        .from('listings')
        .update({ featured: newFeaturedStatus })
        .eq('id', listing.id)
        .select('id, business, featured')
        .single()

      if (error) {
        setStatus('Error toggling featured: ' + error.message)
        return
      }

      setStatus(`✅ Successfully toggled! ${data.business} is now ${data.featured ? 'featured' : 'not featured'}`)

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Fix & Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Schema Check</h2>
          <button
            onClick={checkAndFixDatabase}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check & Fix Database'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Featured Toggle</h2>
          <button
            onClick={testFeaturedToggle}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Featured Toggle'}
          </button>
        </div>

        {status && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Status:</h3>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
