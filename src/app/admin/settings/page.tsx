'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Settings } from 'lucide-react'
import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'DirectoryHub',
    niche: 'Dog Park',
    country: 'USA'
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load current settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings({
            siteName: data.site_name || 'DirectoryHub',
            niche: data.niche || 'Dog Park',
            country: data.country || 'USA'
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        // Fallback to default values
        setSettings({
          siteName: 'DirectoryHub',
          niche: 'Dog Park',
          country: 'USA'
        })
      }
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_name: settings.siteName,
          niche: settings.niche,
          country: settings.country
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        const errorData = await response.json()
        console.error('Error saving settings:', errorData.error)
        alert('Failed to save settings. Please try again.')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
          
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-gray-600 mt-1">Configure your site&apos;s basic information</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., DirectoryHub, MyDirectory, etc."
              />
              <p className="text-sm text-gray-500 mt-1">
                This appears in the browser tab and site header
              </p>
            </div>

            {/* Niche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niche/Business Type
              </label>
              <input
                type="text"
                value={settings.niche}
                onChange={(e) => handleChange('niche', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dog Park, Restaurant, Hotel, etc."
              />
              <p className="text-sm text-gray-500 mt-1">
                The main type of business your directory focuses on
              </p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country/Region
              </label>
              <select
                value={settings.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USA">USA</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                The country/region your directory serves
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Site Name:</span> {settings.siteName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Main Title:</span> Find the Best Local {settings.niche}s {settings.country}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subtitle:</span> Discover top-rated {settings.niche.toLowerCase()}s in {settings.country}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Settings saved successfully!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How it works</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • <strong>Site Name:</strong> This will appear in the browser tab and site header
            </p>
            <p>
              • <strong>Niche:</strong> This will be used throughout the site (e.g., &quot;Dog Park&quot;, &quot;Restaurant&quot;, &quot;Hotel&quot;)
            </p>
            <p>
              • <strong>Country:</strong> This will be added to the main title and subtitle
            </p>
            <p>
              • Changes will be reflected across the entire site including the homepage, city pages, and SEO
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
