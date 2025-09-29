'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, CreditCard, Star, Clock, Mail, Phone, Calendar, DollarSign, Shield, Zap } from 'lucide-react'
import { getSiteSettings } from '@/lib/dynamic-config'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id') || 'N/A'
  const businessName = searchParams.get('business') || 'Your Business'
  
  // If no parameters, show generic thank you
  const isGeneric = !searchParams.get('id') && !searchParams.get('business')
  
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              {dynamicSettings.siteName}
            </Link>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isGeneric ? 'Thank You!' : `Thank You, ${businessName}!`}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {isGeneric 
              ? 'Your submission has been received successfully' 
              : 'Your featured listing application has been received successfully'
            }
          </p>
          {!isGeneric && (
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-6 py-3 rounded-full">
              <Star className="w-5 h-5 mr-2" />
              <span className="font-semibold">Application ID: {applicationId}</span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* What Happens Next */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Clock className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">What Happens Next?</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Review Process</h3>
                  <p className="text-gray-600">We&apos;ll review your application within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Setup</h3>
                  <p className="text-gray-600">We&apos;ll contact you to discuss payment and setup</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Go Live</h3>
                  <p className="text-gray-600">Your featured listing will go live after payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Pricing & Benefits</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Featured Listing Price</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-green-600">$9</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600">Simple, affordable pricing</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">What You Get:</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Premium placement at the top</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Featured badge and highlighting</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Priority in search results</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Enhanced business profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <CreditCard className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Credit Card</h3>
              <p className="text-gray-600 text-sm">Visa, Mastercard, American Express</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">PayPal</h3>
              <p className="text-gray-600 text-sm">Secure payment processing</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bank Transfer</h3>
              <p className="text-gray-600 text-sm">Direct bank transfer available</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Need Help or Have Questions?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-blue-100">support@{dynamicSettings.siteName.toLowerCase()}.com</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-blue-100">+1 (555) 123-4567</p>
            </div>
            <div className="flex flex-col items-center">
              <Calendar className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-blue-100">Within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to {dynamicSettings.siteName}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
