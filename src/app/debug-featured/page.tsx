'use client'

import { useState, useEffect } from 'react'
import { Listing, City, State } from '@/types/database'

export default function DebugFeaturedPage() {
  const [listings, setListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [featuredListings, setFeaturedListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all listings
        const allRes = await fetch('/api/listings')
        const allData = await allRes.json()
        setListings(Array.isArray(allData) ? allData : [])

        // Fetch featured listings
        const featuredRes = await fetch('/api/listings?featured=true')
        const featuredData = await featuredRes.json()
        setFeaturedListings(Array.isArray(featuredData) ? featuredData : [])

        console.log('All listings:', allData)
        console.log('Featured listings:', featuredData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Featured Listings Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total listings: {listings.length}</p>
        <p>Featured listings: {featuredListings.length}</p>
        <p>Featured from all listings: {listings.filter(l => l.featured === true).length}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">All Listings with Featured Status</h2>
        <div className="space-y-2">
          {listings.map((listing) => (
            <div key={listing.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <span className="font-medium">{listing.business}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  listing.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.featured ? 'FEATURED' : 'Not Featured'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {listing.cities?.name}, {listing.cities?.states?.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Featured Listings from API</h2>
        <div className="space-y-2">
          {featuredListings.map((listing) => (
            <div key={listing.id} className="p-3 border rounded bg-green-50">
              <div className="font-medium">{listing.business}</div>
              <div className="text-sm text-gray-600">
                {listing.cities?.name}, {listing.cities?.states?.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Featured Column</h2>
        <a 
          href="/api/test-featured-column" 
          target="_blank" 
          className="text-blue-600 hover:underline"
        >
          Click here to test the featured column
        </a>
      </div>
    </div>
  )
}






