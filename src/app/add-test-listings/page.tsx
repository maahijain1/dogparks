'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddTestListingsPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const addTestListings = async () => {
    setLoading(true)
    setStatus('🚀 Adding test listings for Albury...\n')

    try {
      // First, find Albury city
      setStatus(prev => prev + '1. Finding Albury city...\n')
      const { data: albury, error: alburyError } = await supabase
        .from('cities')
        .select('id, name, states(name)')
        .or('name.eq.Albury,name.ilike.%albury%')
        .single()

      if (alburyError || !albury) {
        setStatus(prev => prev + `❌ Albury city not found: ${alburyError?.message}\n`)
        return
      }

      setStatus(prev => prev + `✅ Found Albury: ${albury.name} (ID: ${albury.id})\n`)

      // Add test listings
      const testListings = [
        {
          business: 'Albury Pet Boarding',
          category: 'Pet Boarding',
          review_rating: 4.5,
          number_of_reviews: 23,
          address: '123 Main Street, Albury NSW 2640',
          phone: '(02) 6021 1234',
          email: 'info@alburypetboarding.com',
          website: 'https://alburypetboarding.com',
          city_id: albury.id,
          featured: true
        },
        {
          business: 'Riverside Kennels',
          category: 'Dog Boarding',
          review_rating: 4.8,
          number_of_reviews: 45,
          address: '456 River Road, Albury NSW 2640',
          phone: '(02) 6021 5678',
          email: 'contact@riversidekennels.com.au',
          website: 'https://riversidekennels.com.au',
          city_id: albury.id,
          featured: true
        },
        {
          business: 'Albury Dog Resort',
          category: 'Pet Services',
          review_rating: 4.2,
          number_of_reviews: 18,
          address: '789 Park Avenue, Albury NSW 2640',
          phone: '(02) 6021 9012',
          email: 'bookings@alburydogresort.com',
          city_id: albury.id,
          featured: false
        },
        {
          business: 'Border Pet Care',
          category: 'Pet Boarding',
          review_rating: 4.7,
          number_of_reviews: 32,
          address: '321 Border Street, Albury NSW 2640',
          phone: '(02) 6021 3456',
          email: 'hello@borderpetcare.com',
          city_id: albury.id,
          featured: true
        }
      ]

      setStatus(prev => prev + `2. Adding ${testListings.length} test listings...\n`)

      let addedCount = 0
      for (const listing of testListings) {
        const { error: insertError } = await supabase
          .from('listings')
          .insert([listing])

        if (insertError) {
          setStatus(prev => prev + `❌ Error adding ${listing.business}: ${insertError.message}\n`)
        } else {
          addedCount++
          setStatus(prev => prev + `✅ Added: ${listing.business}\n`)
        }
      }

      setStatus(prev => prev + `\n🎉 Successfully added ${addedCount} listings to Albury!\n`)
      setStatus(prev => prev + `Now visit: https://dogparks.vercel.app/city/albury\n`)

    } catch (error) {
      setStatus(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseSchema = async () => {
    setLoading(true)
    setStatus('🔍 Checking database schema...\n')

    try {
      const response = await fetch('/api/fix-database-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const result = await response.json()

      if (response.ok) {
        setStatus(prev => prev + `✅ Database check completed:\n`)
        setStatus(prev => prev + JSON.stringify(result.results, null, 2) + '\n')
      } else {
        setStatus(prev => prev + `❌ Database check failed: ${result.error}\n`)
        if (result.fix) {
          setStatus(prev => prev + `\n🔧 FIX NEEDED:\n${result.fix}\n`)
        }
      }
    } catch (error) {
      setStatus(prev => prev + `❌ Error checking database: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚀 Add Test Listings for Albury</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Check Database Schema</h2>
          <p className="text-gray-600 mb-4">
            First, let&apos;s check if the database has the required columns.
          </p>
          <button
            onClick={checkDatabaseSchema}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
          >
            {loading ? 'Checking...' : 'Check Database Schema'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Step 2: Add Test Listings</h2>
          <p className="text-gray-600 mb-4">
            This will add 4 test boarding kennels to Albury so you can see listings on the city page.
          </p>
          <button
            onClick={addTestListings}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Test Listings to Albury'}
          </button>
        </div>

        {status && (
          <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mt-6">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
