'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Star, Phone, Mail, Menu, X } from 'lucide-react'
import { Listing, Article, City, State } from '@/types/database'
import { siteConfig } from '@/lib/config'
import { getSiteSettings, generateDynamicContent } from '@/lib/dynamic-config'

// Function to clean article content and remove empty heading tags
// function cleanArticleContent(content: string): string {
//   if (!content) return ''
//   
//   // Remove empty heading tags (h1, h2, h3, h4, h5, h6) that have no content or only whitespace
//   return content
//     .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '') // Remove empty heading tags
//     .replace(/<h[1-6][^>]*>\s*&nbsp;\s*<\/h[1-6]>/gi, '') // Remove heading tags with only &nbsp;
//     .replace(/<h[1-6][^>]*>\s*<br\s*\/?>\s*<\/h[1-6]>/gi, '') // Remove heading tags with only <br>
//     .replace(/<h[1-6][^>]*>\s*<p>\s*<\/p>\s*<\/h[1-6]>/gi, '') // Remove heading tags with empty paragraphs
//     .replace(/\s+/g, ' ') // Clean up multiple spaces
//     .trim()
// }

// Function to strip HTML tags for meta descriptions
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim()
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [cities, setCities] = useState<(City & { states: State })[]>([])
  const [states, setStates] = useState<State[]>([])
  const [featuredListings, setFeaturedListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [allListings, setAllListings] = useState<(Listing & { cities: City & { states: State } })[]>([])
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(30) // 30 listings per page
  const [articlesCurrentPage, setArticlesCurrentPage] = useState(1)
  const [articlesPerPage] = useState(12) // 12 articles per page

  // Articles pagination calculations
  const articlesTotalPages = Math.ceil(latestArticles.length / articlesPerPage)
  const articlesStartIndex = (articlesCurrentPage - 1) * articlesPerPage
  const articlesEndIndex = articlesStartIndex + articlesPerPage
  const articlesToShow = latestArticles.slice(articlesStartIndex, articlesEndIndex)
  const [dynamicSettings, setDynamicSettings] = useState({
    siteName: 'DirectoryHub',
    niche: 'Dog Park',
    country: 'USA'
  })

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    minRating: '',
    minReviews: '',
    featured: false,
    hasPhone: false,
    hasWebsite: false,
    // Kennel-specific filters
    boardingType: '',
    dogSize: '',
    services: [] as string[],
    supervision24_7: false,
    cctvAccess: false,
    vetOnCall: false,
    vaccinationRequired: false,
    minPrice: '',
    maxPrice: '',
    priceType: 'night',
    outdoorSpace: false,
    indoorSpace: false,
    specialDiet: false,
    medication: false,
    socialPlaytime: false,
    individualAttention: false,
    webcamAccess: false,
    insurance: false,
    specialNeeds: false,
    temperatureControlled: false,
    noiseLevel: '',
    minYearsBusiness: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

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

  // Clear search and filters
  const clearSearch = () => {
    setSearchQuery('')
    setSelectedCity('')
    setSelectedState('')
    setFilters({
      category: '',
      minRating: '',
      minReviews: '',
      featured: false,
      hasPhone: false,
      hasWebsite: false,
      // Kennel-specific filters
      boardingType: '',
      dogSize: '',
      services: [],
      supervision24_7: false,
      cctvAccess: false,
      vetOnCall: false,
      vaccinationRequired: false,
      minPrice: '',
      maxPrice: '',
      priceType: 'night',
      outdoorSpace: false,
      indoorSpace: false,
      specialDiet: false,
      medication: false,
      socialPlaytime: false,
      individualAttention: false,
      webcamAccess: false,
      insurance: false,
      specialNeeds: false,
      temperatureControlled: false,
      noiseLevel: '',
      minYearsBusiness: ''
    })
    setCurrentPage(1) // Reset to first page
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      minRating: '',
      minReviews: '',
      featured: false,
      hasPhone: false,
      hasWebsite: false,
      // Kennel-specific filters
      boardingType: '',
      dogSize: '',
      services: [],
      supervision24_7: false,
      cctvAccess: false,
      vetOnCall: false,
      vaccinationRequired: false,
      minPrice: '',
      maxPrice: '',
      priceType: 'night',
      outdoorSpace: false,
      indoorSpace: false,
      specialDiet: false,
      medication: false,
      socialPlaytime: false,
      individualAttention: false,
      webcamAccess: false,
      insurance: false,
      specialNeeds: false,
      temperatureControlled: false,
      noiseLevel: '',
      minYearsBusiness: ''
    })
    setCurrentPage(1)
  }

  // Update filter
  const updateFilter = (key: string, value: string | boolean | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Reset page when search or city filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCity])

  // Bootstrap latest articles from localStorage to avoid empty first paint
  useEffect(() => {
    try {
      const cached = localStorage.getItem('latest_articles')
      if (cached && latestArticles.length === 0) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLatestArticles(parsed)
        }
      }
    } catch {
      // ignore
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  // Fetch data with error boundaries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ts = Date.now()
        // Build filter parameters
        const filterParams = new URLSearchParams()
        if (selectedCity) filterParams.set('cityId', selectedCity)
        if (selectedState) filterParams.set('stateId', selectedState)
        if (filters.category) filterParams.set('category', filters.category)
        if (filters.minRating) filterParams.set('minRating', filters.minRating)
        if (filters.minReviews) filterParams.set('minReviews', filters.minReviews)
        if (filters.featured) filterParams.set('featured', 'true')
        if (filters.hasPhone) filterParams.set('hasPhone', 'true')
        if (filters.hasWebsite) filterParams.set('hasWebsite', 'true')
        if (searchQuery) filterParams.set('search', searchQuery)
        
        // Kennel-specific filters
        if (filters.boardingType) filterParams.set('boardingType', filters.boardingType)
        if (filters.dogSize) filterParams.set('dogSize', filters.dogSize)
        if (filters.services.length > 0) filterParams.set('services', filters.services.join(','))
        if (filters.supervision24_7) filterParams.set('supervision24_7', 'true')
        if (filters.cctvAccess) filterParams.set('cctvAccess', 'true')
        if (filters.vetOnCall) filterParams.set('vetOnCall', 'true')
        if (filters.vaccinationRequired) filterParams.set('vaccinationRequired', 'true')
        if (filters.minPrice) filterParams.set('minPrice', filters.minPrice)
        if (filters.maxPrice) filterParams.set('maxPrice', filters.maxPrice)
        if (filters.priceType) filterParams.set('priceType', filters.priceType)
        if (filters.outdoorSpace) filterParams.set('outdoorSpace', 'true')
        if (filters.indoorSpace) filterParams.set('indoorSpace', 'true')
        if (filters.specialDiet) filterParams.set('specialDiet', 'true')
        if (filters.medication) filterParams.set('medication', 'true')
        if (filters.socialPlaytime) filterParams.set('socialPlaytime', 'true')
        if (filters.individualAttention) filterParams.set('individualAttention', 'true')
        if (filters.webcamAccess) filterParams.set('webcamAccess', 'true')
        if (filters.insurance) filterParams.set('insurance', 'true')
        if (filters.specialNeeds) filterParams.set('specialNeeds', 'true')
        if (filters.temperatureControlled) filterParams.set('temperatureControlled', 'true')
        if (filters.noiseLevel) filterParams.set('noiseLevel', filters.noiseLevel)
        if (filters.minYearsBusiness) filterParams.set('minYearsBusiness', filters.minYearsBusiness)

        const [statesRes, citiesRes, allListingsRes, articlesRes] = await Promise.all([
          fetch(`/api/states?_=${ts}`, { cache: 'no-store' }),
          fetch(`/api/cities?_=${ts}`, { cache: 'no-store' }),
          fetch(`/api/listings?${filterParams.toString()}&_=${ts}`, { cache: 'no-store' }),
          fetch(`/api/articles?published=true&exclude_city_articles=true&_=${ts}`, { cache: 'no-store' })
        ])

        // Try to fetch featured listings separately to handle potential errors
        let featuredRes
        try {
          // Fetch featured listings for the selected city or first city
          const featuredUrl = selectedCity 
            ? `/api/listings?featured=true&cityId=${selectedCity}&_=${ts}`
            : `/api/listings?featured=true&_=${ts}`
          featuredRes = await fetch(featuredUrl)
        } catch {
          console.log('Featured listings API not available yet, using fallback')
          featuredRes = null
        }

        let statesData = await statesRes.json()
        let citiesData = await citiesRes.json()
        const featuredData = featuredRes ? await featuredRes.json() : []
        let allListingsData = await allListingsRes.json()

        // Retry cache-busted if empty
        if (!Array.isArray(statesData) || statesData.length === 0) {
          try {
            const retry = await fetch(`/api/states?_=${Date.now()}`, { cache: 'no-store' })
            const retryJson = await retry.json()
            if (Array.isArray(retryJson)) statesData = retryJson
          } catch {}
        }
        if (!Array.isArray(citiesData) || citiesData.length === 0) {
          try {
            const retry = await fetch(`/api/cities?_=${Date.now()}`, { cache: 'no-store' })
            const retryJson = await retry.json()
            if (Array.isArray(retryJson)) citiesData = retryJson
          } catch {}
        }
        if (!Array.isArray(allListingsData) || allListingsData.length === 0) {
          try {
            const retry = await fetch(`/api/listings?${filterParams.toString()}&_=${Date.now()}`, { cache: 'no-store' })
            const retryJson = await retry.json()
            if (Array.isArray(retryJson)) allListingsData = retryJson
          } catch {}
        }
        let articlesData = await articlesRes.json()
        // Retry with cache-busting if empty (handles stale CDN caches)
        if (!Array.isArray(articlesData) || articlesData.length === 0) {
          try {
            const retryRes = await fetch(`/api/articles?published=true&exclude_city_articles=true&_=${Date.now()}`, { cache: 'no-store' })
            const retryData = await retryRes.json()
            if (Array.isArray(retryData)) {
              articlesData = retryData
            }
          } catch {
            // ignore
          }
        }
        
        // Debug: Check articles data
        console.log('Fetched articles count:', articlesData?.length || 0)
        

        setStates(Array.isArray(statesData) ? statesData : [])
        setCities(Array.isArray(citiesData) ? citiesData : [])
        
        // Extract unique categories from all listings
        const allListings = Array.isArray(allListingsData) ? allListingsData : []
        const uniqueCategories = [...new Set(allListings.map(listing => listing.category).filter(Boolean))]
        setCategories(uniqueCategories)
        
        // If featured listings API fails or returns empty, filter featured from all listings
        const featuredListings = Array.isArray(featuredData) ? featuredData : []
        
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
        // Persist to localStorage to improve subsequent loads
        try {
          localStorage.setItem('latest_articles', JSON.stringify(articlesToSet.slice(0, 50)))
        } catch {
          // ignore
        }
      } catch {
        // Error fetching data
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
  }, [selectedCity, selectedState, filters, searchQuery])

  // Refetch featured listings when city changes
  useEffect(() => {
    const fetchFeaturedForCity = async () => {
      if (selectedCity) {
        try {
          const featuredRes = await fetch(`/api/listings?featured=true&cityId=${selectedCity}&_=${Date.now()}`)
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
          const featuredRes = await fetch(`/api/listings?featured=true&_=${Date.now()}`)
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

  // Since we're now using API-based filtering, we can use allListings directly
  // The filtering is now handled by the API endpoint
  const filteredListings = allListings

  // Structured Data for Homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": dynamicSettings.siteName,
    "description": `Find local ${dynamicSettings.niche.toLowerCase()}s in ${dynamicSettings.country} with reviews, ratings, and contact information`,
    "url": `https://${dynamicSettings.siteName.toLowerCase().replace(/\s+/g, '')}.com`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `https://${dynamicSettings.siteName.toLowerCase().replace(/\s+/g, '')}.com/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": dynamicSettings.siteName,
      "url": `https://${dynamicSettings.siteName.toLowerCase().replace(/\s+/g, '')}.com`
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
            sizes="100vw"
            quality={75}
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
            <div className="max-w-4xl mx-auto">
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
                  
                  {(searchQuery || selectedCity || selectedState || Object.values(filters).some(v => v !== '' && v !== false)) && (
                    <button
                      onClick={clearSearch}
                      className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center transition-colors duration-200 border border-gray-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                  >
                    {showFilters ? 'Hide Filters' : 'Show Filters'} 
                    <span className="ml-1">{showFilters ? '▲' : '▼'}</span>
                  </button>
                </div>

                {showFilters && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="space-y-8">
                      {/* Basic Filters Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* State Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All States</option>
                            {states.map((state) => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Rating
                          </label>
                          <select
                            value={filters.minRating}
                            onChange={(e) => updateFilter('minRating', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Any Rating</option>
                            <option value="3">3+ Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="4.5">4.5+ Stars</option>
                          </select>
                        </div>

                        {/* Review Count Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Reviews
                          </label>
                          <select
                            value={filters.minReviews}
                            onChange={(e) => updateFilter('minReviews', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Any Reviews</option>
                            <option value="10">10+ Reviews</option>
                            <option value="50">50+ Reviews</option>
                            <option value="100">100+ Reviews</option>
                          </select>
                        </div>
                      </div>

                      {/* Kennel-Specific Filters */}
                      <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">🐕 Kennel-Specific Filters</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Boarding Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Boarding Type
                            </label>
                            <select
                              value={filters.boardingType}
                              onChange={(e) => updateFilter('boardingType', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Any Type</option>
                              <option value="cage-based">Cage-based</option>
                              <option value="suite">Suite</option>
                              <option value="free-roam">Free-roam</option>
                              <option value="in-home">In-home</option>
                            </select>
                          </div>

                          {/* Dog Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dog Size Accepted
                            </label>
                            <select
                              value={filters.dogSize}
                              onChange={(e) => updateFilter('dogSize', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Any Size</option>
                              <option value="small">Small Dogs Only</option>
                              <option value="medium">Medium Dogs</option>
                              <option value="large">Large Dogs</option>
                              <option value="all-sizes">All Sizes</option>
                            </select>
                          </div>

                          {/* Price Range */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Range (per {filters.priceType})
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                placeholder="Min $"
                                value={filters.minPrice}
                                onChange={(e) => updateFilter('minPrice', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="number"
                                placeholder="Max $"
                                value={filters.maxPrice}
                                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <select
                              value={filters.priceType}
                              onChange={(e) => updateFilter('priceType', e.target.value)}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="night">Per Night</option>
                              <option value="week">Per Week</option>
                              <option value="month">Per Month</option>
                            </select>
                          </div>

                          {/* Services Offered */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Services Offered
                            </label>
                            <div className="space-y-2">
                              {['playtime', 'walks', 'grooming', 'training', 'medical'].map((service) => (
                                <label key={service} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={filters.services.includes(service)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        updateFilter('services', [...filters.services, service])
                                      } else {
                                        updateFilter('services', filters.services.filter(s => s !== service))
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 capitalize">{service}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Supervision & Safety */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Supervision & Safety
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.supervision24_7}
                                  onChange={(e) => updateFilter('supervision24_7', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">24/7 Staff</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.cctvAccess}
                                  onChange={(e) => updateFilter('cctvAccess', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">CCTV Access</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.vetOnCall}
                                  onChange={(e) => updateFilter('vetOnCall', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vet On Call</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.vaccinationRequired}
                                  onChange={(e) => updateFilter('vaccinationRequired', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Vaccination Required</span>
                              </label>
                            </div>
                          </div>

                          {/* Facilities & Amenities */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Facilities & Amenities
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.outdoorSpace}
                                  onChange={(e) => updateFilter('outdoorSpace', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Outdoor Space</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.indoorSpace}
                                  onChange={(e) => updateFilter('indoorSpace', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Indoor Space</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.temperatureControlled}
                                  onChange={(e) => updateFilter('temperatureControlled', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Temperature Controlled</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.webcamAccess}
                                  onChange={(e) => updateFilter('webcamAccess', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Webcam Access</span>
                              </label>
                            </div>
                          </div>

                          {/* Special Care */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Special Care
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.specialDiet}
                                  onChange={(e) => updateFilter('specialDiet', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Special Diet</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.medication}
                                  onChange={(e) => updateFilter('medication', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Medication Administered</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.specialNeeds}
                                  onChange={(e) => updateFilter('specialNeeds', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Special Needs</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.individualAttention}
                                  onChange={(e) => updateFilter('individualAttention', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Individual Attention</span>
                              </label>
                            </div>
                          </div>

                          {/* Additional Options */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional Options
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.socialPlaytime}
                                  onChange={(e) => updateFilter('socialPlaytime', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Social Playtime</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.insurance}
                                  onChange={(e) => updateFilter('insurance', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Insurance Coverage</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.featured}
                                  onChange={(e) => updateFilter('featured', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filters.hasPhone}
                                  onChange={(e) => updateFilter('hasPhone', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Has Phone</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="flex justify-center pt-4 border-t">
                        <button
                          onClick={clearFilters}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Search Results Indicator */}
            {(searchQuery || selectedState || selectedCity || Object.values(filters).some(v => v !== '' && v !== false)) && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center text-green-800">
                  <Search className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    {filteredListings.length > 0 
                      ? `Found ${filteredListings.length} ${dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'}`
                      : `No ${dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'} found`
                    }
                    {searchQuery && ` for "${searchQuery}"`}
                    {selectedState && ` in ${states.find(s => s.id === selectedState)?.name}`}
                    {selectedCity && ` in ${cities.find(c => c.id === selectedCity)?.name}`}
                    {filters.featured && ' (Featured Only)'}
                    {filters.minRating && ` (${filters.minRating}+ Stars)`}
                    {filters.category && ` (${filters.category})`}
                  </span>
                </div>
                {filteredListings.length === 0 && (
                  <p className="text-sm text-green-600 mt-1 text-center">
                    Try adjusting your search terms or filters
                  </p>
                )}
              </div>
            )}
            
            {/* Location-based suggestion */}
            {userLocation && !searchQuery && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-medium">Showing {dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'} near your location</span>
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
              Featured {dynamicSettings.niche.endsWith('s') ? dynamicSettings.niche : dynamicSettings.niche + 's'}
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked premium {dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'} that stand out from the crowd
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
              Explore {dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'} in different states
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {states.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No States Found</h3>
                <p className="text-gray-600 mb-4">Create states in the admin panel to get started.</p>
                <Link 
                  href="/admin/listings/states" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Add States
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {states.map((state) => {
                  const stateUrl = `/${dynamicSettings.niche.toLowerCase().replace(/\s+/g, '-')}-${state.name.toLowerCase().replace(/\s+/g, '-')}`
                  console.log('State link generated:', state.name, '→', stateUrl)
                  
                  return (
                    <Link
                      key={state.id}
                      href={stateUrl}
                      className="group relative bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-center hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-center min-h-[2.5rem]">
                        <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm leading-tight">
                          {state.name}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
                    </Link>
                  )
                })}
              </div>
            )}
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
              {selectedState && !selectedCity && !searchQuery && (
                <span> in {states.find(s => s.id === selectedState)?.name}</span>
              )}
              {filters.featured && ' (Featured Only)'}
              {filters.minRating && ` (${filters.minRating}+ Stars)`}
              {filters.category && ` (${filters.category})`}
            </p>
            
            
            {userLocation && !searchQuery && !selectedCity && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
                <div className="flex items-center justify-center text-blue-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-sm">
                    📍 Your location has been detected. Browse our directory or search for specific cities to find {dynamicSettings.niche.toLowerCase().endsWith('s') ? dynamicSettings.niche.toLowerCase() : dynamicSettings.niche.toLowerCase() + 's'}.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {(() => {
              // Show ALL listings (both featured and non-featured)
              const listingsToShow = filteredListings
              // const totalPages = Math.ceil(listingsToShow.length / itemsPerPage)
              const startIndex = (currentPage - 1) * itemsPerPage
              const endIndex = startIndex + itemsPerPage
              const paginatedListings = listingsToShow.slice(startIndex, endIndex)
              
              return paginatedListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{listing.business}</h3>
                  
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
                        <a 
                          href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}
                    
                    {listing.review_rating && Number(listing.review_rating) > 0 && (
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
              ))
            })()}
          </div>

          {/* Pagination Controls */}
          {(() => {
            const listingsToShow = filteredListings
            const totalPages = Math.ceil(listingsToShow.length / itemsPerPage)
            
            if (totalPages <= 1) return null
            
            return (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (
                      pageNum === currentPage - 3 ||
                      pageNum === currentPage + 3
                    ) {
                      return <span key={pageNum} className="px-2 py-2 text-gray-500">...</span>
                    }
                    return null
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            )
          })()}

          {/* Pagination Info */}
          {(() => {
            const listingsToShow = filteredListings
            const totalPages = Math.ceil(listingsToShow.length / itemsPerPage)
            const startIndex = (currentPage - 1) * itemsPerPage
            const endIndex = Math.min(startIndex + itemsPerPage, listingsToShow.length)
            
            if (listingsToShow.length === 0) return null
            
            return (
              <div className="text-center mt-4 text-sm text-gray-600">
                Showing {startIndex + 1} - {endIndex} of {listingsToShow.length} listings
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Knowledge Hub */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-bold text-lg">KNOWLEDGE HUB</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Expert Insights & Guides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover expert tips, industry insights, and comprehensive guides to help you make informed decisions
            </p>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articlesToShow.length === 0 ? (
              <></>
            ) : (
              articlesToShow.map((article, index) => (
              <article key={article.id} className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
                <div className="relative overflow-hidden">
                  {article.featured_image ? (
                    <Image 
                      src={article.featured_image} 
                      alt={article.title}
                      width={400}
                      height={150}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={75}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">📝</div>
                        <div className="text-sm font-medium">Article</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(article.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">
                      {index === 0 ? '🔥 Trending' : index === 1 ? '⭐ Featured' : '📚 Guide'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    <Link href={`/${article.slug}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </h3>
                  
                  <div className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {stripHtmlTags(article.content || '').substring(0, 150)}
                    {stripHtmlTags(article.content || '').length > 150 && '...'}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/${article.slug}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                    >
                      Read More
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">5 min read</span>
                    </div>
                  </div>
                </div>
              </article>
              ))
            )}
          </div>

          {/* Articles Pagination Controls */}
          {articlesTotalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => setArticlesCurrentPage(1)}
                disabled={articlesCurrentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                First
              </button>
              <button
                onClick={() => setArticlesCurrentPage(articlesCurrentPage - 1)}
                disabled={articlesCurrentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, articlesTotalPages) }, (_, i) => {
                  let pageNum;
                  if (articlesTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (articlesCurrentPage <= 3) {
                    pageNum = i + 1;
                  } else if (articlesCurrentPage >= articlesTotalPages - 2) {
                    pageNum = articlesTotalPages - 4 + i;
                  } else {
                    pageNum = articlesCurrentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setArticlesCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium border ${
                        articlesCurrentPage === pageNum
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                      } cursor-pointer`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setArticlesCurrentPage(articlesCurrentPage + 1)}
                disabled={articlesCurrentPage === articlesTotalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
              <button
                onClick={() => setArticlesCurrentPage(articlesTotalPages)}
                disabled={articlesCurrentPage === articlesTotalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Last
              </button>
            </div>
          )}

          {/* Articles Pagination Info */}
          {latestArticles.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {articlesStartIndex + 1}-{Math.min(articlesEndIndex, latestArticles.length)} of {latestArticles.length} articles
              {articlesTotalPages > 1 && (
                <span className="ml-2">• Page {articlesCurrentPage} of {articlesTotalPages}</span>
              )}
            </div>
          )}
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
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="text-gray-300 hover:text-white">Disclaimer</Link></li>
                <li><Link href="/cookie-policy" className="text-gray-300 hover:text-white">Cookie Policy</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@{dynamicSettings.siteName.toLowerCase().replace(/\s+/g, '')}.com</span>
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
