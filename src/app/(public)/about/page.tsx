'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Target, Award } from 'lucide-react'
import { getSiteSettings } from '@/lib/dynamic-config'

export default function AboutPage() {
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About {dynamicSettings.siteName}
          </h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Connecting you with the best local {dynamicSettings.niche.toLowerCase()}s
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8">
              At {dynamicSettings.siteName}, we believe that finding the right local {dynamicSettings.niche.toLowerCase()} should be simple, 
              reliable, and trustworthy. Our mission is to connect you with the best local {dynamicSettings.niche.toLowerCase()}s 
              in your area, helping you make informed decisions about where to spend your time and money.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
            <p className="text-lg text-gray-700 mb-8">
              We curate and maintain a comprehensive directory of local {dynamicSettings.niche.toLowerCase()}s, complete with 
              detailed information, reviews, and contact details. Our platform makes it easy to 
              discover new {dynamicSettings.niche.toLowerCase()}s, compare services, and find exactly what you&apos;re looking for 
              in your local area.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community First</h3>
                <p className="text-gray-600">
                  We prioritize the needs of our local communities and support local businesses.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Accuracy</h3>
                <p className="text-gray-600">
                  We ensure all business information is accurate, up-to-date, and reliable.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality</h3>
                <p className="text-gray-600">
                  We maintain high standards for the businesses featured in our directory.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose DirectoryHub?</h2>
            <ul className="text-lg text-gray-700 space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Comprehensive listings with detailed business information</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Real customer reviews and ratings</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Easy-to-use search and filtering options</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Regularly updated information</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span>Mobile-friendly platform</span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-700 mb-8">
              Have questions about our directory or want to suggest a business for inclusion? 
              We&apos;d love to hear from you. Contact us through our{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                contact page
              </Link>{' '}
              or reach out to us directly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Local Businesses?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring our directory today and discover amazing local services.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Browse Directory
          </Link>
        </div>
      </section>
    </div>
  )
}







