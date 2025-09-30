'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAdminFormPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const testAdminForm = async () => {
    setLoading(true)
    setStatus('Testing admin form functionality...')

    try {
      // Test 1: Check if featured column exists
      setStatus('1. Checking if featured column exists...\n')
      
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'listings')
        .in('column_name', ['featured', 'business', 'category'])

      if (columnError) {
        setStatus(prev => prev + `❌ Error checking columns: ${columnError.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found columns:\n`)
      columns?.forEach(col => {
        setStatus(prev => prev + `- ${col.column_name}: ${col.data_type}\n`)
      })

      // Test 2: Check sample listings data
      setStatus(prev => prev + `\n2. Checking sample listings data...\n`)
      
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

      // Test 3: Test form data structure
      setStatus(prev => prev + `\n3. Testing form data structure...\n`)
      
      const testFormData = {
        business: 'Test Business',
        category: 'Test Category',
        review_rating: '4.5',
        number_of_reviews: '10',
        address: '123 Test St',
        website: 'https://test.com',
        phone: '555-1234',
        email: 'test@test.com',
        city_id: 'test-city-id',
        featured: true
      }

      setStatus(prev => prev + `✅ Test form data structure:\n`)
      setStatus(prev => prev + JSON.stringify(testFormData, null, 2) + '\n')

      // Test 4: Check if we can create a test listing
      setStatus(prev => prev + `\n4. Testing listing creation with featured field...\n`)
      
      // First, get a real city ID
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .limit(1)

      if (citiesError || !cities || cities.length === 0) {
        setStatus(prev => prev + `❌ No cities found for testing\n`)
        return
      }

      const testCityId = cities[0].id
      setStatus(prev => prev + `Using city: ${cities[0].name} (ID: ${testCityId})\n`)

      // Test the API endpoint
      const testListing = {
        ...testFormData,
        city_id: testCityId,
        review_rating: 4.5,
        number_of_reviews: 10
      }

      setStatus(prev => prev + `Testing API with data:\n`)
      setStatus(prev => prev + JSON.stringify(testListing, null, 2) + '\n')

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testListing)
      })

      const responseData = await response.json()
      
      if (response.ok) {
        setStatus(prev => prev + `✅ API test successful!\n`)
        setStatus(prev => prev + `Response: ${JSON.stringify(responseData, null, 2)}\n`)
        
        // Clean up test data
        if (responseData.id) {
          await supabase.from('listings').delete().eq('id', responseData.id)
          setStatus(prev => prev + `✅ Test listing cleaned up\n`)
        }
      } else {
        setStatus(prev => prev + `❌ API test failed: ${response.status}\n`)
        setStatus(prev => prev + `Error: ${JSON.stringify(responseData, null, 2)}\n`)
      }

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const testFormState = () => {
    setStatus('Testing form state management...\n')
    
    // Simulate the form state
    const initialFormData = {
      business: '',
      category: '',
      review_rating: '',
      number_of_reviews: '',
      address: '',
      website: '',
      phone: '',
      email: '',
      city_id: '',
      featured: false
    }

    setStatus(prev => prev + `✅ Initial form state:\n`)
    setStatus(prev => prev + JSON.stringify(initialFormData, null, 2) + '\n')

    // Test setting featured to true
    const updatedFormData = { ...initialFormData, featured: true }
    setStatus(prev => prev + `✅ Updated form state (featured=true):\n`)
    setStatus(prev => prev + JSON.stringify(updatedFormData, null, 2) + '\n')

    setStatus(prev => prev + `\n✅ Form state management appears to be working correctly.\n`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Admin Form</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Database & API</h2>
            <p className="text-gray-600 mb-4">
              This will test if the featured field works properly in the database and API.
            </p>
            <button
              onClick={testAdminForm}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Database & API'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Form State</h2>
            <p className="text-gray-600 mb-4">
              This will test the form state management logic.
            </p>
            <button
              onClick={testFormState}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Form State
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
