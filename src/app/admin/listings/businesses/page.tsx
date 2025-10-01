'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Upload, Building2, X } from "lucide-react";
import { Listing, City, State } from '@/types/database'
import AdminHeader from '@/components/AdminHeader'

export default function BusinessesPage() {
  const [listings, setListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [cities, setCities] = useState<(City & { states: State })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)
  const [importing, setImporting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
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
  })
  const [importFormData, setImportFormData] = useState({
    city_id: ''
  })
  const [cityListingCounts, setCityListingCounts] = useState<{[key: string]: number}>({})
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('')

  // Calculate listing counts per city
  const calculateCityCounts = (listings: (Listing & { cities: City & { states: State } })[]) => {
    const counts: {[key: string]: number} = {}
    listings.forEach(listing => {
      const cityId = listing.city_id
      counts[cityId] = (counts[cityId] || 0) + 1
    })
    setCityListingCounts(counts)
  }

  // Filter listings by selected city
  const filteredListings = selectedCityFilter 
    ? listings.filter(listing => listing.city_id === selectedCityFilter)
    : listings

  // Fetch listings and cities
  const fetchListings = useCallback(async () => {
    try {
      const response = await fetch('/api/listings')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const listingsData = Array.isArray(data) ? data : []
      setListings(listingsData)
      calculateCityCounts(listingsData)
    } catch (error) {
      console.error('Error fetching listings:', error)
      setListings([])
      setCityListingCounts({})
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCities = useCallback(async () => {
    try {
      const response = await fetch('/api/cities')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching cities:', error)
      setCities([])
    }
  }, [])

  useEffect(() => {
    fetchListings()
    fetchCities()
  }, [fetchListings, fetchCities])



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', formData)
    
    // Validation
    if (!formData.business.trim()) {
      alert('Business name is required')
      return
    }
    if (!formData.category.trim()) {
      alert('Category is required')
      return
    }
    if (!formData.city_id) {
      alert('Please select a city')
      return
    }
    
    setSubmitting(true)
    
    try {
      const url = editingListing ? `/api/listings/${editingListing.id}` : '/api/listings'
      const method = editingListing ? 'PUT' : 'POST'
      
      const requestBody = {
        ...formData,
        review_rating: parseFloat(formData.review_rating) || 0,
        number_of_reviews: parseInt(formData.number_of_reviews) || 0
      }
      
      console.log('Sending request to:', url, 'with method:', method)
      console.log('Request body:', requestBody)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Success response:', result)
        await fetchListings()
        resetForm()
        alert(editingListing ? 'Listing updated successfully!' : 'Listing created successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Error: ${errorData.error || 'Failed to save listing'}`)
      }
    } catch (error) {
      console.error('Error saving listing:', error)
      alert(`Error saving listing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle CSV import
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const file = fileInputRef.current?.files?.[0]
    const cityId = importFormData.city_id

    if (!file || !cityId) {
      alert('Please select a CSV file and a city')
      return
    }

    setImporting(true)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('cityId', cityId)

      const response = await fetch('/api/listings/import', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const result = await response.json()
        const message = result.stats && result.stats.filtered > 0 
          ? `Successfully imported ${result.stats.imported} listings (${result.stats.filtered} listings without phone/website were filtered out)`
          : `Successfully imported ${result.data.length} listings`
        alert(message)
        await fetchListings()
        setShowImportModal(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(`Import failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
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
    })
    setImportFormData({
      city_id: ''
    })
    setShowForm(false)
    setEditingListing(null)
  }

  // Handle edit
  const handleEdit = (listing: Listing) => {
    console.log('=== EDIT LISTING DEBUG ===')
    console.log('Listing data:', listing)
    console.log('Featured value:', listing.featured)
    
    setEditingListing(listing)
    const newFormData = {
      business: listing.business,
      category: listing.category,
      review_rating: listing.review_rating.toString(),
      number_of_reviews: listing.number_of_reviews.toString(),
      address: listing.address,
      website: listing.website,
      phone: listing.phone,
      email: listing.email || '',
      city_id: listing.city_id,
      featured: listing.featured || false
    }
    
    console.log('Setting form data:', newFormData)
    setFormData(newFormData)
    setShowForm(true)
  }

  // Handle toggle featured
  const handleToggleFeatured = async (listing: Listing) => {
    const newFeaturedStatus = !listing.featured
    
    console.log('=== TOGGLE FEATURED DEBUG ===')
    console.log('Listing ID:', listing.id)
    console.log('Business:', listing.business)
    console.log('Current featured:', listing.featured)
    console.log('New featured status:', newFeaturedStatus)
    
    try {
      // Optimistically update the UI first
      setListings(prevListings => 
        prevListings.map(l => 
          l.id === listing.id 
            ? { ...l, featured: newFeaturedStatus }
            : l
        )
      )
      
      console.log('Optimistic update applied')
      
      const requestBody = {
        id: listing.id,
        featured: newFeaturedStatus
      }
      
      console.log('Sending request body:', requestBody)
      
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Successfully toggled featured status')
        console.log('API response:', result)
        
        // Update the specific listing with the actual result from the database
        setListings(prevListings => 
          prevListings.map(l => 
            l.id === listing.id 
              ? { ...l, featured: result.featured }
              : l
          )
        )
        
        console.log('✅ UI updated with actual database value:', result.featured)
        
      } else {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        console.error('Error details:', errorData)
        
        // Revert the optimistic update
        setListings(prevListings => 
          prevListings.map(l => 
            l.id === listing.id 
              ? { ...l, featured: listing.featured }
              : l
          )
        )
        
        alert(`Error: ${errorData.error || 'Failed to update featured status'}\n\nCheck console for details.`)
      }
    } catch (error) {
      console.error('❌ Network/Other Error:', error)
      
      // Revert the optimistic update
      setListings(prevListings => 
        prevListings.map(l => 
          l.id === listing.id 
            ? { ...l, featured: listing.featured }
            : l
        )
      )
      
      alert(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Optimistic update - remove from UI immediately without refetching
        setListings(prevListings => {
          const updatedListings = prevListings.filter(listing => listing.id !== id)
          calculateCityCounts(updatedListings)
          return updatedListings
        })
      } else {
        alert('Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <AdminHeader title="Manage Business Listings" showBackButton={true} backUrl="/admin" />
      <div className="container mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/listings" 
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Business Listings
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Import CSV files or add individual business listings
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import CSV
              </button>
              <button
                onClick={() => {
                  setShowForm(true)
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Listing
              </button>
            </div>
          </div>
        </div>


        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{listings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Cities with Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(cityListingCounts).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Featured Listings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listings.filter(listing => listing.featured).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Max Featured per City</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
            </div>
          </div>
        </div>

        {/* City Filter Buttons */}
        {Object.keys(cityListingCounts).length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter by City</h3>
              {selectedCityFilter && (
                <button
                  onClick={() => setSelectedCityFilter('')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cities
                .filter(city => cityListingCounts[city.id] > 0)
                .sort((a, b) => (cityListingCounts[b.id] || 0) - (cityListingCounts[a.id] || 0))
                .map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCityFilter(city.id)}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedCityFilter === city.id 
                        ? 'bg-blue-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-medium ${selectedCityFilter === city.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {city.name}
                      </p>
                      <p className={`text-sm ${selectedCityFilter === city.id ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'}`}>
                        {city.states?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium mb-1 ${
                        selectedCityFilter === city.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {cityListingCounts[city.id]} listings
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCityFilter === city.id 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      }`}>
                        {listings.filter(l => l.city_id === city.id && l.featured).length}/3 featured
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}



        {/* Add/Edit Form Modal - Excel Format */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingListing ? 'Edit Listing' : 'Add New Listing'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingListing(null)
                    setFormData({
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
                    })
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business *
                    </label>
                    <input
                      type="text"
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Club-K9, Dog Park"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Dog park, Pet boarding"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.review_rating}
                      onChange={(e) => setFormData({ ...formData, review_rating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 4.7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Reviews
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.number_of_reviews}
                      onChange={(e) => setFormData({ ...formData, number_of_reviews: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 43"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 19350 Winmeade Dr, Leesburg, VA 20176"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., (571) 926-9000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., contact@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city_id}
                    onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.states?.name} ({cityListingCounts[city.id] || 0} listings)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Listing Checkbox - Always Visible */}
                <div className={`border rounded-lg p-4 ${formData.featured ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="featured-listing"
                      checked={formData.featured}
                      onChange={(e) => {
                        console.log('Featured checkbox changed:', e.target.checked)
                        setFormData({ ...formData, featured: e.target.checked })
                      }}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <span className={`text-sm font-medium ${formData.featured ? 'text-yellow-800' : 'text-gray-700'}`}>
                        ⭐ Featured Listing {formData.featured ? '(ENABLED)' : '(DISABLED)'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        This listing will appear in the featured section on city pages and homepage
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Current state: {formData.featured ? 'true' : 'false'}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingListing(null)
                      setFormData({
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
                      })
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingListing ? 'Update' : 'Add')} Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Import CSV File
              </h2>
              <form onSubmit={handleCSVImport}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select City for Import *
                  </label>
                  <select
                    value={importFormData.city_id}
                    onChange={(e) => setImportFormData({ city_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a city to import listings into</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.states?.name} ({cityListingCounts[city.id] || 0} listings)
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    All listings from the CSV will be imported into the selected city.
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">CSV Format with Featured Listings:</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Add a &quot;Featured&quot; column to your CSV with values: <code className="bg-blue-100 px-1 rounded">true</code>, <code className="bg-blue-100 px-1 rounded">1</code>, or <code className="bg-blue-100 px-1 rounded">yes</code>
                    </p>
                    <p className="text-xs text-blue-600">
                      Example: Business, Category, Review Rating, Number of Reviews, Address, Website, Phone, Email, Featured
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CSV File *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    CSV should have columns: Business, Category, Review Ra, Number o, Address, Website, Phone, Email
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={importing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Import CSV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false)
                      setImportFormData({ city_id: '' })
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Listings Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {cities.length === 0 
                  ? 'First create states and cities, then add listings.'
                  : 'Get started by importing a CSV file or adding individual listings.'
                }
              </p>
              {cities.length > 0 && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import CSV
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Listing
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {selectedCityFilter && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Showing {filteredListings.length} listings for {cities.find(c => c.id === selectedCityFilter)?.name}
                    </p>
                    <button
                      onClick={() => setSelectedCityFilter('')}
                      className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium"
                    >
                      ✕ Clear Filter
                    </button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Reviews
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredListings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {selectedCityFilter 
                          ? `No listings found for ${cities.find(c => c.id === selectedCityFilter)?.name}. Clear the filter or add listings.`
                          : 'No listings found. Add your first listing above.'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="w-5 h-5 text-green-500 mr-3" />
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {listing.business}
                              </span>
                              {listing.featured && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            {listing.phone && (
                              <div className="text-sm text-gray-500">
                                {listing.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {listing.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {listing.review_rating > 0 ? `${listing.review_rating} ⭐` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {listing.number_of_reviews}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {listing.cities?.name}, {listing.cities?.states?.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeatured(listing)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              listing.featured 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {listing.featured ? 'Featured' : 'Make Featured'}
                          </button>
                          <button
                            onClick={() => handleEdit(listing)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
