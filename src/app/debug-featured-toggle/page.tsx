'use client'

import { useState } from 'react'

export default function DebugFeaturedTogglePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const testFeaturedColumn = async () => {
    setLoading(true)
    setStatus('Testing featured column...\n')

    try {
      const response = await fetch('/api/test-featured-column')
      const result = await response.json()
      
      setStatus(prev => prev + `API Response: ${JSON.stringify(result, null, 2)}\n`)
      
      if (result.success) {
        setStatus(prev => prev + `\n✅ Featured column is working correctly!\n`)
      } else {
        setStatus(prev => prev + `\n❌ Featured column has issues:\n`)
        setStatus(prev => prev + `Error: ${result.error}\n`)
        if (result.sql) {
          setStatus(prev => prev + `\nTo fix, run this SQL in your Supabase dashboard:\n`)
          setStatus(prev => prev + `${result.sql}\n`)
        }
      }
    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testFeaturedToggle = async () => {
    setLoading(true)
    setStatus('Testing featured toggle with a real listing...\n')

    try {
      // First, get a listing
      const listingsResponse = await fetch('/api/listings')
      const listingsResult = await listingsResponse.json()
      
      if (!listingsResult.success || !listingsResult.data || listingsResult.data.length === 0) {
        setStatus(prev => prev + `❌ No listings found to test with\n`)
        return
      }

      const testListing = listingsResult.data[0]
      setStatus(prev => prev + `Testing with listing: ${testListing.business}\n`)
      setStatus(prev => prev + `Current featured status: ${testListing.featured}\n`)

      // Toggle the featured status
      const newFeaturedStatus = !testListing.featured
      setStatus(prev => prev + `Toggling to: ${newFeaturedStatus}\n`)

      const toggleResponse = await fetch(`/api/listings/${testListing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testListing.id,
          featured: newFeaturedStatus
        })
      })

      const toggleResult = await toggleResponse.json()
      setStatus(prev => prev + `Toggle response: ${JSON.stringify(toggleResult, null, 2)}\n`)

      if (toggleResponse.ok) {
        setStatus(prev => prev + `\n✅ Toggle successful!\n`)
        setStatus(prev => prev + `New featured status: ${toggleResult.featured}\n`)
        
        // Revert the change
        setStatus(prev => prev + `Reverting change...\n`)
        const revertResponse = await fetch(`/api/listings/${testListing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: testListing.id,
            featured: testListing.featured
          })
        })
        
        if (revertResponse.ok) {
          setStatus(prev => prev + `✅ Successfully reverted\n`)
        } else {
          setStatus(prev => prev + `❌ Failed to revert\n`)
        }
      } else {
        setStatus(prev => prev + `\n❌ Toggle failed!\n`)
        setStatus(prev => prev + `Error: ${toggleResult.error}\n`)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Featured Toggle</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Featured Column</h2>
            <p className="text-gray-600 mb-4">
              This will test if the featured column exists and works in your database.
            </p>
            <button
              onClick={testFeaturedColumn}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Column'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Featured Toggle</h2>
            <p className="text-gray-600 mb-4">
              This will test the actual featured toggle functionality with a real listing.
            </p>
            <button
              onClick={testFeaturedToggle}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Toggle'}
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
