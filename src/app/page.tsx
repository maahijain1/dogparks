'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Star, Phone, Mail, Menu, X } from 'lucide-react'
import { Listing, Article, City, State } from '@/types/database'
import { siteConfig } from '@/lib/config'
import { getSiteSettings, generateDynamicContent } from '@/lib/dynamic-config'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<(City & { states: State })[]>([])
  const [featuredListings, setFeaturedListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [allListings, setAllListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [dynamicSettings, setDynamicSettings] = useState({
    siteName: 'DirectoryHub',
    niche: 'Dog Park',
    country: 'USA'
  })

  // Load dynamic settings
  const loadDynamicSettings = async () => {
    try {
      const settings = await getSiteSettings()
      setDynamicSettings({
        siteName: settings.site_name || 'DirectoryHub',
        niche: settings.niche || 'Dog Park',
        country: settings.country || 'USA'
      })
    } catch (error) {
      console.error('Error loading dynamic settings:', error)
    }
  }

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationLoading(false)
        
        // Log location for debugging
        console.log('User location detected:', { lat: latitude, lng: longitude })
      },
      (error) => {
        console.log('Error getting location:', error)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Handle search
  const handleSearch = () => {
    const searchLower = searchQuery.toLowerCase()
    
    // Check if search query matches a city name and auto-select it
    const matchingCity = cities.find(city => 
      city.name.toLowerCase().includes(searchLower) ||
      city.states?.name.toLowerCase().includes(searchLower) ||
      `${city.name}, ${city.states?.name}`.toLowerCase().includes(searchLower)
    )
    
    if (matchingCity) {
      setSelectedCity(matchingCity.id)
      console.log('Auto-selected city:', matchingCity.name, matchingCity.states?.name)
    }
    
    console.log('Searching for:', searchQuery, 'in city:', selectedCity)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCity('')
  }


  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, allListingsRes, articlesRes] = await Promise.all([
          fetch('/api/cities', { cache: 'no-store' }),
          fetch('/api/listings', { cache: 'no-store' }),
          fetch('/api/articles?published=true', { cache: 'no-store' })
        ])

        // Try to fetch featured listings separately to handle potential errors
        let featuredRes
        try {
          // Fetch featured listings for the selected city or first city
          const featuredUrl = selectedCity 
            ? `/api/listings?featured=true&cityId=${selectedCity}`
            : '/api/listings?featured=true'
          featuredRes = await fetch(featuredUrl)
        } catch {
          console.log('Featured listings API not available yet, using fallback')
          featuredRes = null
        }

        const citiesData = await citiesRes.json()
        const featuredData = featuredRes ? await featuredRes.json() : []
        const allListingsData = await allListingsRes.json()
        const articlesData = await articlesRes.json()
        

        setCities(Array.isArray(citiesData) ? citiesData : [])
        
        // If featured listings API fails or returns empty, filter featured from all listings
        const featuredListings = Array.isArray(featuredData) ? featuredData : []
        const allListings = Array.isArray(allListingsData) ? allListingsData : []
        
        
        // If featured API failed, filter featured listings from all listings
        if (featuredListings.length === 0 && allListings.length > 0) {
          const featuredFromAll = allListings.filter(listing => listing.featured === true)
          setFeaturedListings(featuredFromAll)
        } else {
          setFeaturedListings(featuredListings)
        }
        setAllListings(allListings)
        const articlesToSet = Array.isArray(articlesData) ? articlesData : []
        setLatestArticles(articlesToSet) // All articles
      } catch (error) {
        console.error('Error fetching data:', error)
        console.error('Error details:', error)
        // Set empty arrays on error to prevent crashes
        setCities([])
        setFeaturedListings([])
        setAllListings([])
        setLatestArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    loadDynamicSettings()
    getUserLocation()
  }, [selectedCity])

  // Refetch featured listings when city changes
  useEffect(() => {
    const fetchFeaturedForCity = async () => {
      if (selectedCity) {
        try {
          const featuredRes = await fetch(`/api/listings?featured=true&cityId=${selectedCity}`)
          const featuredData = await featuredRes.json()
          setFeaturedListings(Array.isArray(featuredData) ? featuredData : [])
        } catch (error) {
          console.error('Error fetching featured listings for city:', error)
          // Fallback to filtering from all listings
          const featuredFromAll = allListings.filter(listing => 
            listing.featured === true && listing.city_id === selectedCity
          ).slice(0, 3)
          setFeaturedListings(featuredFromAll)
        }
      } else {
        // If no city selected, show featured from all cities (limit 3)
        try {
          const featuredRes = await fetch('/api/listings?featured=true')
          const featuredData = await featuredRes.json()
          setFeaturedListings(Array.isArray(featuredData) ? featuredData.slice(0, 3) : [])
        } catch (error) {
          console.error('Error fetching featured listings:', error)
          const featuredFromAll = allListings.filter(listing => listing.featured === true).slice(0, 3)
          setFeaturedListings(featuredFromAll)
        }
      }
    }

    // Only run if we have listings and city has actually changed
    if (allListings.length > 0) {
      fetchFeaturedForCity()
    }
  }, [selectedCity, allListings]) // Added allListings dependency back

  // Filter listings based on search
  const filteredListings = allListings.filter(listing => {
    // If search query is empty, just filter by city
    if (searchQuery === '') {
      // If no city selected, show all listings
      if (!selectedCity || selectedCity === '' || selectedCity === null) {
        return true
      }
      // If city selected, show only listings from that city
      return listing.city_id === selectedCity
    }
    
    const searchLower = searchQuery.toLowerCase()
    
    // Check if search query matches a city name
    const matchesCity = cities.some(city => 
      city.name.toLowerCase().includes(searchLower) ||
      city.states?.name.toLowerCase().includes(searchLower) ||
      `${city.name}, ${city.states?.name}`.toLowerCase().includes(searchLower)
    )
    
    // If searching for a city, show all listings from that city
    if (matchesCity) {
      const matchingCity = cities.find(city => 
        city.name.toLowerCase().includes(searchLower) ||
        city.states?.name.toLowerCase().includes(searchLower) ||
        `${city.name}, ${city.states?.name}`.toLowerCase().includes(searchLower)
      )
      
      if (matchingCity) {
        return listing.city_id === matchingCity.id
      }
    }
    
    // Otherwise, search in business details
    const matchesBusiness = 
      listing.business.toLowerCase().includes(searchLower) ||
      listing.category.toLowerCase().includes(searchLower) ||
      listing.address.toLowerCase().includes(searchLower)
    
    const matchesCityFilter = selectedCity === '' || listing.city_id === selectedCity
    
    return matchesBusiness && matchesCityFilter
  })

  // Structured Data for Homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": dynamicSettings.siteName,
    "description": `Find local ${dynamicSettings.niche.toLowerCase()}s in ${dynamicSettings.country} with reviews, ratings, and contact information`,
    "url": "https://directoryhub.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://directoryhub.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": dynamicSettings.siteName,
      "url": "https://directoryhub.com"
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                {dynamicSettings.siteName}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/about" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                <Link href="/get-featured" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Get Featured
                </Link>
                <Link href="/privacy" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Contact
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link href="/" className="text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                About
              </Link>
              <Link href="/get-featured" className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Get Featured
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-gray-500 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 py-20 overflow-hidden" aria-labelledby="hero-heading">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background-simple.svg"
            alt=""
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold mb-6">
              {generateDynamicContent(siteConfig.content.hero.title, {
                site_name: dynamicSettings.siteName,
                niche: dynamicSettings.niche,
                country: dynamicSettings.country
              })}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              {generateDynamicContent(siteConfig.content.hero.subtitle, {
                site_name: dynamicSettings.siteName,
                niche: dynamicSettings.niche,
                country: dynamicSettings.country
              })}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={generateDynamicContent(siteConfig.content.hero.searchPlaceholder, {
                      site_name: dynamicSettings.siteName,
                      niche: dynamicSettings.niche,
                      country: dynamicSettings.country
                    })}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-12 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Search className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="md:w-64">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">All Cities</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.states?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!userLocation && !locationLoading && (
                    <button
                      onClick={getUserLocation}
                      className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      📍 Use My Location
                    </button>
                  )}
                  
                </div>
                
                {/* Search/Clear Buttons */}
                <div className="md:w-auto flex gap-2">
                  <button
                    onClick={handleSearch}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center transition-colors duration-200"
                  >
                    <Search className="h-3 w-3 mr-1" />
                      {generateDynamicContent(siteConfig.content.hero.searchButton, {
                        site_name: dynamicSettings.siteName,
                        niche: dynamicSettings.niche,
                        country: dynamicSettings.country
                      })}
                  </button>
                  
                  {(searchQuery || selectedCity) && (
                    <button
                      onClick={clearSearch}
                      className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center transition-colors duration-200 border border-gray-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center text-green-800">
                  <Search className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {filteredListings.length > 0 
                      ? `Found ${filteredListings.length} ${siteConfig.niche.toLowerCase()}s for "${searchQuery}"`
                      : `No ${siteConfig.niche.toLowerCase()}s found for "${searchQuery}"`
                    }
                  </span>
                </div>
                {filteredListings.length === 0 && (
                  <p className="text-sm text-green-600 mt-1 text-center">
                    Try searching for a city name or business category
                  </p>
                )}
              </div>
            )}
            
            {/* Location-based suggestion */}
            {userLocation && !searchQuery && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">Showing {siteConfig.niche.toLowerCase()}s near your location</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Use the search above to find specific businesses or change the city filter
                </p>
              </div>
            )}
            
            {locationLoading && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Detecting your location...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50" aria-labelledby="featured-listings">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Star className="h-6 w-6 mr-2 fill-current" />
              <span className="font-bold text-lg">PREMIUM FEATURED LISTINGS</span>
            </div>
            <h2 id="featured-listings" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {siteConfig.content.featured.title}
            </h2>
            <p className="text-xl text-gray-600">
              {siteConfig.content.featured.subtitle}
            </p>
          </div>


          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing) => (
                <div key={listing.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-yellow-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{listing.business}</h3>
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ Featured
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {listing.address && (
                      <p><span className="font-medium">Address:</span> {listing.address}</p>
                    )}
                    {listing.phone && (
                      <div className="flex items-center justify-between">
                        <p><span className="font-medium">Phone:</span> {listing.phone}</p>
                        <a 
                          href={`tel:${listing.phone}`}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>
                    )}
                    {listing.website && (
                      <p>
                        <span className="font-medium">Website:</span>{' '}
                        <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </p>
                    )}
                    {listing.review_rating > 0 && (
                      <p>
                        <span className="font-medium">Rating:</span> {listing.review_rating}/5 
                        <span className="ml-1 text-yellow-500">★</span>
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.cities?.name}, {listing.cities?.states?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </section>

      {/* Browse by State */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by State
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Explore {siteConfig.niche.toLowerCase()}s in different states
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {(() => {
              const states = cities.reduce((states, city) => {
                const existingState = states.find(s => s.id === city.states?.id)
                if (existingState) {
                  existingState.cities.push(city)
                  existingState.totalListings += allListings.filter(listing => listing.city_id === city.id).length
                } else if (city.states) {
                  states.push({
                    id: city.states.id,
                    name: city.states.name,
                    cities: [city],
                    totalListings: allListings.filter(listing => listing.city_id === city.id).length
                  })
                }
                return states
              }, [] as Array<{id: string, name: string, cities: Array<{id: string, name: string}>, totalListings: number}>)
              
              
              // If no states found from cities, show a message
              if (states.length === 0 && cities.length > 0) {
                return (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">States Not Linked</h3>
                    <p className="text-gray-600 mb-4">Cities exist but are not linked to states. Please check your admin panel.</p>
                    <Link 
                      href="/admin/listings/cities" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Fix City-States Links
                    </Link>
                  </div>
                )
              }
              
              return states.map((state) => (
              <Link
                key={state.id}
                href={`/${siteConfig.niche.toLowerCase().replace(/\s+/g, '-')}-${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {state.name}
              </Link>
              ))
            })()}
          </div>

          {cities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No States Available</h3>
              <p className="text-gray-600">States will appear here once cities are added to the directory.</p>
            </div>
          )}
        </div>
      </section>

        {/* All Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Listings'}
            </h2>
            <p className="text-xl text-gray-600">
              {filteredListings.length} businesses found
              {selectedCity && !searchQuery && (
                <span> in {cities.find(c => c.id === selectedCity)?.name}</span>
              )}
            </p>
            
            
            {userLocation && !searchQuery && !selectedCity && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm">
                    📍 Your location has been detected. Browse our directory or search for specific cities to find {siteConfig.niche.toLowerCase()}s.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{listing.business}</h3>
                  {listing.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {listing.address && (
                    <p><span className="font-medium">Address:</span> {listing.address}</p>
                  )}
                  {listing.phone && (
                    <div className="flex items-center justify-between">
                      <p><span className="font-medium">Phone:</span> {listing.phone}</p>
                      <a 
                        href={`tel:${listing.phone}`}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        📞 Call
                      </a>
                    </div>
                  )}
                  {listing.website && (
                    <p>
                      <span className="font-medium">Website:</span>{' '}
                      <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </p>
                  )}
                  {listing.review_rating > 0 && (
                    <p>
                      <span className="font-medium">Rating:</span> {listing.review_rating}/5 
                      <span className="ml-1 text-yellow-500">★</span>
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.cities?.name}, {listing.cities?.states?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All Articles
            </h2>
            <p className="text-xl text-gray-600">
              Stay updated with our latest insights
            </p>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">
                No articles available
              </div>
            ) : (
              latestArticles.map((article) => (
              <article key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {article.featured_image && (
                  <Image 
                    src={article.featured_image} 
                    alt={article.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    <Link href={`/${article.slug}`} className="hover:text-blue-600">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                  <div 
                    className="text-gray-700 text-sm line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }}
                  />
                  <Link 
                    href={`/${article.slug}`}
                    className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{dynamicSettings.siteName}</h3>
              <p className="text-gray-300 mb-4">
                Your trusted source for finding the best local businesses. 
                We connect you with top-rated services in your area.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link href="/get-featured" className="text-gray-300 hover:text-white">Get Featured</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@directoryhub.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <span>123 Business St<br />City, State 12345</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {dynamicSettings.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
    </>
  )
}
