'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Listing, City, State } from '@/types/database'

export default function FixFeaturedPage() {
  const [listings, setListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/check-featured-status')
      const data = await response.json()
      if (data.success) {
        setListings(data.allListings)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (listing: Listing) => {
    setUpdating(listing.id)
    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listing.id,
          featured: !listing.featured
        })
      })

      if (response.ok) {
        await fetchListings()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error updating featured status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  const featuredListings = listings.filter(l => l.featured === true)
  const nonFeaturedListings = listings.filter(l => l.featured !== true)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fix Featured Listings</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p>Total listings: {listings.length}</p>
        <p>Featured listings: {featuredListings.length}</p>
        <p>Non-featured listings: {nonFeaturedListings.length}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Featured Listings ({featuredListings.length})</h2>
        {featuredListings.length === 0 ? (
          <p className="text-gray-600">No featured listings found. Click the buttons below to mark listings as featured.</p>
        ) : (
          <div className="space-y-2">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="p-3 border rounded bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{listing.business}</div>
                    <div className="text-sm text-gray-600">
                      {listing.cities?.name}, {listing.cities?.states?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeatured(listing)}
                    disabled={updating === listing.id}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {updating === listing.id ? 'Updating...' : 'Featured ✓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Listings - Click to Make Featured</h2>
        <div className="space-y-2">
          {listings.map((listing) => (
            <div key={listing.id} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{listing.business}</div>
                  <div className="text-sm text-gray-600">
                    {listing.cities?.name}, {listing.cities?.states?.name}
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(listing)}
                  disabled={updating === listing.id}
                  className={`px-3 py-1 rounded text-white hover:opacity-80 disabled:opacity-50 ${
                    listing.featured 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {updating === listing.id ? 'Updating...' : 
                   listing.featured ? 'Featured ✓' : 'Make Featured'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="space-x-4">
          <a 
            href="/api/check-featured-status" 
            target="_blank" 
            className="text-blue-600 hover:underline"
          >
            Check Featured Status API
          </a>
          <Link 
            href="/debug-featured" 
            className="text-blue-600 hover:underline"
          >
            Debug Page
          </Link>
        </div>
      </div>
    </div>
  )
}






