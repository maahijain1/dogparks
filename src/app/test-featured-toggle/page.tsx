'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestFeaturedTogglePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const testFeaturedColumn = async () => {
    setLoading(true)
    setStatus('Testing featured column...\n')

    try {
      // Test 1: Check if featured column exists
      setStatus('1. Checking if featured column exists...\n')
      
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'listings')
        .eq('column_name', 'featured')

      if (columnError) {
        setStatus(prev => prev + `❌ Error checking columns: ${columnError.message}\n`)
        return
      }

      if (columns && columns.length > 0) {
        setStatus(prev => prev + `✅ Featured column exists!\n`)
        setStatus(prev => prev + `Column details: ${JSON.stringify(columns[0], null, 2)}\n`)
      } else {
        setStatus(prev => prev + `❌ Featured column does NOT exist!\n`)
        setStatus(prev => prev + `You need to add the featured column to your database.\n`)
        return
      }

      // Test 2: Check current listings
      setStatus(prev => prev + `\n2. Checking current listings...\n`)
      
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, featured')
        .limit(5)

      if (listingsError) {
        setStatus(prev => prev + `❌ Error fetching listings: ${listingsError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found ${listings?.length || 0} listings:\n`)
      listings?.forEach(listing => {
        setStatus(prev => prev + `- ${listing.business}: featured=${listing.featured}\n`)
      })

      // Test 3: Try to update a listing's featured status
      if (listings && listings.length > 0) {
        const testListing = listings[0]
        setStatus(prev => prev + `\n3. Testing featured toggle for: ${testListing.business}\n`)
        
        const newFeaturedStatus = !testListing.featured
        setStatus(prev => prev + `Changing featured from ${testListing.featured} to ${newFeaturedStatus}\n`)
        
        const { data: updateResult, error: updateError } = await supabase
          .from('listings')
          .update({ featured: newFeaturedStatus })
          .eq('id', testListing.id)
          .select('id, business, featured')
          .single()

        if (updateError) {
          setStatus(prev => prev + `❌ Update failed: ${updateError.message}\n`)
        } else {
          setStatus(prev => prev + `✅ Update successful!\n`)
          setStatus(prev => prev + `Result: ${JSON.stringify(updateResult, null, 2)}\n`)
          
          // Revert the change
          setStatus(prev => prev + `Reverting change back to ${testListing.featured}...\n`)
          await supabase
            .from('listings')
            .update({ featured: testListing.featured })
            .eq('id', testListing.id)
          
          setStatus(prev => prev + `✅ Change reverted\n`)
        }
      }

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const addFeaturedColumn = async () => {
    setLoading(true)
    setStatus('Adding featured column to database...\n')

    try {
      // Add the featured column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;'
      })

      if (alterError) {
        setStatus(prev => prev + `❌ Error adding column: ${alterError.message}\n`)
        setStatus(prev => prev + `You may need to add this column manually in your Supabase dashboard.\n`)
        setStatus(prev => prev + `SQL: ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;\n`)
      } else {
        setStatus(prev => prev + `✅ Featured column added successfully!\n`)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Featured Toggle</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Featured Column</h2>
            <p className="text-gray-600 mb-4">
              This will test if the featured column exists and works properly.
            </p>
            <button
              onClick={testFeaturedColumn}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Featured Column'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Featured Column</h2>
            <p className="text-gray-600 mb-4">
              This will add the featured column if it doesn&apos;t exist.
            </p>
            <button
              onClick={addFeaturedColumn}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Featured Column'}
            </button>
          </div>
        </div>

        {status && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
