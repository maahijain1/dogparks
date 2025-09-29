'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const testEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test email service', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Email Service Test</h1>
          
          <div className="mb-6">
            <button
              onClick={testEmail}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Email Service'}
            </button>
          </div>

          {result && (
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <h3 className="font-semibold mb-2">What this test does:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Checks if RESEND_API_KEY is configured</li>
              <li>Checks if ADMIN_EMAIL is configured</li>
              <li>Tests sending admin notification email</li>
              <li>Tests sending confirmation email</li>
              <li>Shows detailed error messages if something fails</li>
              <li>Validates email addresses and configuration</li>
            </ul>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Resend Free Tier Limitations:</h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Can only send emails to verified email addresses</li>
                <li>Rate limited to 2 requests per second</li>
                <li>For production: verify your domain at resend.com/domains</li>
                <li>Current test sends to: bankonkamalakar@gmail.com (verified)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
