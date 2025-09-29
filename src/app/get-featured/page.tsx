'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Check, CreditCard } from 'lucide-react'
import { getSiteSettings } from '@/lib/dynamic-config'

export default function GetFeaturedPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    category: '',
    description: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [dynamicSettings, setDynamicSettings] = useState({
    siteName: 'DirectoryHub',
    niche: 'Dog Park',
    country: 'USA'
  })
  const [loading, setLoading] = useState(true)

  // Load dynamic settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSiteSettings()
        setDynamicSettings({
          siteName: settings.site_name || 'DirectoryHub',
          niche: settings.niche || 'Dog Park',
          country: settings.country || 'USA'
        })
      } catch (error) {
        console.error('Error loading dynamic settings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  // Handle featured listing form submission
  const handleFeaturedFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)

    try {
      console.log('Submitting form with data:', formData)
      
      const response = await fetch('/api/featured-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        // Redirect to thank you page with application details
        const params = new URLSearchParams({
          id: result.applicationId,
          business: formData.businessName
        })
        
        console.log('Redirecting to:', `/thank-you?${params.toString()}`)
        
        // Try multiple redirect methods
        try {
          window.location.href = `/thank-you?${params.toString()}`
        } catch (redirectError) {
          console.error('Redirect failed, trying alternative method:', redirectError)
          // Fallback: use window.location.replace
          window.location.replace(`/thank-you?${params.toString()}`)
        }
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        alert(`Error: ${error.error || 'Failed to submit application'}`)
        setFormSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting featured listing application:', error)
      alert('There was an error submitting your request. Please try again.')
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              {dynamicSettings.siteName}
            </Link>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Your {dynamicSettings.niche} Featured!
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Stand out from the crowd with a premium featured listing
            </p>
            <div className="inline-flex items-center bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full shadow-lg">
              <Star className="h-6 w-6 mr-2 fill-current" />
              <span className="font-bold text-lg">FEATURED LISTING</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Listing Plan
            </h2>
            <p className="text-xl text-gray-600">
              Get premium visibility for your {dynamicSettings.niche.toLowerCase()} in one city
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Single Pricing Card */}
            <div className="bg-white rounded-2xl p-8 relative border-4 border-yellow-400 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold">
                  FEATURED LISTING
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Per City</h3>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">$9<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600">For one city only</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Premium placement in search results for your city</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Featured badge and special styling</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Analytics and insights for your city</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Enhanced visibility in local searches</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Easy cancellation anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apply for Featured Listing
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below to get started with your featured listing
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">Featured Listing</h3>
                  <p className="text-gray-600">For one city only</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">$9<span className="text-lg text-gray-600">/month</span></div>
                  <div className="text-sm text-gray-500">Per city</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleFeaturedFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your business name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your state"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`e.g., ${dynamicSettings.niche}, Pet Boarding, etc.`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your business, what makes it special, and why customers should choose you..."
                />
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-3">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>We&apos;ll review your application within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You&apos;ll receive a payment link to complete your subscription</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Your featured listing will go live in your selected city within 48 hours</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You can cancel anytime with 30 days notice</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center text-lg font-medium"
                >
                  {formSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-3" />
                      Get Featured - $9/month per city!
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3">How quickly will my listing go live?</h3>
              <p className="text-gray-600">Your featured listing will be live within 48 hours of payment confirmation. We review all applications to ensure quality.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes! You can cancel your subscription anytime with 30 days notice. No long-term contracts required.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3">What makes a featured listing different?</h3>
              <p className="text-gray-600">Featured listings appear at the top of search results, have special styling, and include premium badges for maximum visibility.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee if you&apos;re not satisfied with your featured listing performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="text-2xl font-bold text-blue-400 mb-4 inline-block">
              {dynamicSettings.siteName}
            </Link>
            <p className="text-gray-400 mb-6">
              Your trusted directory for finding the best {dynamicSettings.niche.toLowerCase()}s in your area.
            </p>
            <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
              <p>&copy; 2024 {dynamicSettings.siteName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
