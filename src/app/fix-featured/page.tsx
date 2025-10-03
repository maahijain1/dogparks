'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FixFeaturedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    totalUpdated?: number
    totalCities?: number
    details?: string
    error?: string
    results?: Array<{
      city: string
      state: string
      listings: number
      featured: number
      message: string
    }>
  } | null>(null)
  const router = useRouter()

  const handleFixFeatured = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/fix-featured-status', {
        method: 'POST'
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to fix featured status',
        error: 'Failed to fix featured status',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Fix Featured Listings Status
          </h1>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              What this does:
            </h2>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Clears ALL current featured status</li>
              <li>• Selects up to 3 random high-quality listings per city</li>
              <li>• Prioritizes listings with phone + website + higher ratings</li>
              <li>• Ensures only 3 featured listings per city maximum</li>
            </ul>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleFixFeatured}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Fixing...' : 'Fix Featured Status'}
            </button>
            
            <button
              onClick={() => router.push('/admin/listings/businesses')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Back to Admin
            </button>
          </div>

          {result && (
            <div className={`p-6 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              
              <div className="space-y-2 text-sm">
                <p><strong>Message:</strong> {result.message}</p>
                {result.totalUpdated && (
                  <p><strong>Total Updated:</strong> {result.totalUpdated} listings</p>
                )}
                {result.totalCities && (
                  <p><strong>Total Cities:</strong> {result.totalCities} cities</p>
                )}
                {result.details && (
                  <p><strong>Details:</strong> {result.details}</p>
                )}
              </div>

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Results by City:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 text-left">City</th>
                          <th className="px-2 py-1 text-left">State</th>
                          <th className="px-2 py-1 text-left">Total Listings</th>
                          <th className="px-2 py-1 text-left">Featured</th>
                          <th className="px-2 py-1 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((cityResult, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="px-2 py-1">{cityResult.city}</td>
                            <td className="px-2 py-1">{cityResult.state}</td>
                            <td className="px-2 py-1">{cityResult.listings}</td>
                            <td className="px-2 py-1">{cityResult.featured}</td>
                            <td className="px-2 py-1 text-xs">{cityResult.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}