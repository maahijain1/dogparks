'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SetupDatabasePage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const setupDatabase = async () => {
    setLoading(true)
    setStatus('Setting up database...')

    try {
      // Add featured column if it doesn't exist
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
          CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured);
        `
      })

      if (alterError) {
        setStatus('Error setting up database: ' + alterError.message)
        return
      }

      setStatus('✅ Database setup completed successfully!')

      // Test the setup
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, business, featured')
        .limit(3)

      if (listingsError) {
        setStatus(prev => prev + '\n\nError testing: ' + listingsError.message)
        return
      }

      setStatus(prev => prev + `\n\nFound ${listings?.length || 0} listings:`)
      listings?.forEach(listing => {
        setStatus(prev => prev + `\n- ${listing.business} (Featured: ${listing.featured})`)
      })

    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Setup</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Setup Featured Column</h2>
          <p className="text-gray-600 mb-4">
            This will add the 'featured' column to your listings table if it doesn't exist.
          </p>
          <button
            onClick={setupDatabase}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Setup Database'}
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
