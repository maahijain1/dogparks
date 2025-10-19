'use client'

import { useState } from 'react'

export default function TestFeaturedFixPage() {
  const [formData, setFormData] = useState({
    business: 'Test Business',
    category: 'Test Category',
    review_rating: '4.5',
    number_of_reviews: '100',
    address: '123 Test St',
    website: 'https://test.com',
    phone: '555-1234',
    email: 'test@test.com',
    city_id: '1', // You'll need to replace this with a valid city ID
    featured: true // This should now work!
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    try {
      console.log('Test form submitted with data:', formData)
      
      const requestBody = {
        ...formData,
        review_rating: parseFloat(formData.review_rating) || 0,
        number_of_reviews: parseInt(formData.number_of_reviews) || 0
      }
      
      console.log('Sending request with body:', requestBody)
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)
      
      setResult({
        success: response.ok,
        message: response.ok ? 'Listing created successfully with featured status!' : 'Failed to create listing',
        data: responseData
      })
      
    } catch (error) {
      console.error('Error:', error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Featured Listing Creation Fix</h1>
      <p className="text-gray-600 mb-6">
        This page tests whether the featured checkbox now works when creating manual listings.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            value={formData.business}
            onChange={(e) => setFormData({ ...formData, business: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Review Rating</label>
          <input
            type="number"
            step="0.1"
            value={formData.review_rating}
            onChange={(e) => setFormData({ ...formData, review_rating: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Number of Reviews</label>
          <input
            type="number"
            value={formData.number_of_reviews}
            onChange={(e) => setFormData({ ...formData, number_of_reviews: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="text"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">City ID</label>
          <input
            type="text"
            value={formData.city_id}
            onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a valid city ID"
            required
          />
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            ⭐ Mark as Featured Listing (This should now work!)
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Test Create Featured Listing'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? 'Success!' : 'Error'}
          </h3>
          <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
            {result.message}
          </p>
          {result.data && (
            <details className="mt-2">
              <summary className="text-xs text-gray-600 cursor-pointer">View Response Data</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
