import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/lib/config'

interface CityPageProps {
  params: Promise<{ slug: string }>
}

interface Listing {
  id: string
  business: string
  category: string
  review_rating: number
  number_of_reviews: number
  address: string
  website: string
  phone: string
  email: string
  featured: boolean
  city_id: string
  cities?: {
    id: string
    name: string
    states?: {
      id: string
      name: string
    }
  }
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params
  const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    title: `${siteConfig.niche}s ${cityName} | ${siteConfig.siteName}`,
    description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}. Discover top-rated ${siteConfig.niche.toLowerCase()}s, read reviews, and get contact information.`,
    keywords: `${siteConfig.niche.toLowerCase()}s, ${cityName}, local ${siteConfig.niche.toLowerCase()}s, ${siteConfig.niche.toLowerCase()} directory, ${cityName} ${siteConfig.niche.toLowerCase()}s`,
    openGraph: {
      title: `${siteConfig.niche}s ${cityName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
      url: `${siteConfig.siteUrl}/city/${slug}`,
      siteName: siteConfig.siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.niche}s ${cityName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/city/${slug}`,
    },
  }
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params
  const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  console.log('=== CITY PAGE DEBUG ===')
  console.log('URL slug:', slug)
  console.log('Parsed city name:', cityName)
  
  // Fetch listings for this city
  let listings: Listing[] = []
  let totalListings = 0
  let featuredListings = 0
  
  try {
    // Try Supabase first
    const { data: allListings, error: listingsError } = await supabase
      .from('listings')
      .select(`
        *,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )
      `)
      .order('featured', { ascending: false })
      .order('business')
    
    if (!listingsError && allListings) {
      console.log('All listings from Supabase:', allListings.length)
      console.log('Looking for city name:', cityName)
      console.log('All unique city names in listings:', [...new Set(allListings.map((l: Listing) => l.cities?.name).filter(Boolean))])
      
      // Filter listings for this city
      listings = allListings.filter((listing: Listing) => {
        const listingCityName = listing.cities?.name?.toLowerCase().trim()
        const targetCityName = cityName.toLowerCase().trim()
        const matches = listingCityName === targetCityName
        if (matches) {
          console.log('Found matching listing:', listing.business, 'in city:', listing.cities?.name)
        }
        return matches
      })
      
      // If no exact matches, try case-insensitive partial matching
      if (listings.length === 0) {
        console.log('No exact matches found, trying partial matching...')
        listings = allListings.filter((listing: Listing) => {
          const listingCityName = listing.cities?.name?.toLowerCase().trim()
          const targetCityName = cityName.toLowerCase().trim()
          const matches = listingCityName?.includes(targetCityName) || targetCityName.includes(listingCityName || '')
          if (matches) {
            console.log('Found partial matching listing:', listing.business, 'in city:', listing.cities?.name)
          }
          return matches
        })
      }
      
      totalListings = listings.length
      featuredListings = listings.filter((listing: Listing) => listing.featured).length
      console.log('Supabase listings fetch successful:', { totalListings, featuredListings, cityName })
      console.log('Found listings:', listings.map((l: Listing) => ({ business: l.business, city: l.cities?.name })))
    } else {
      console.log('Supabase listings failed, trying API fallback...', listingsError)
      
      // Fallback to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/listings`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const responseData = await response.json()
        const apiListings = responseData.value || responseData
        
        console.log('API fallback - All listings:', apiListings.length)
        console.log('API fallback - Looking for city name:', cityName)
        console.log('API fallback - All unique city names in listings:', [...new Set(apiListings.map((l: Listing) => l.cities?.name).filter(Boolean))])
        
        // Filter listings for this city
        listings = apiListings.filter((listing: Listing) => {
          const listingCityName = listing.cities?.name?.toLowerCase().trim()
          const targetCityName = cityName.toLowerCase().trim()
          const matches = listingCityName === targetCityName
          if (matches) {
            console.log('API fallback - Found matching listing:', listing.business, 'in city:', listing.cities?.name)
          }
          return matches
        })
        
        // If no exact matches, try case-insensitive partial matching
        if (listings.length === 0) {
          console.log('API fallback - No exact matches found, trying partial matching...')
          listings = apiListings.filter((listing: Listing) => {
            const listingCityName = listing.cities?.name?.toLowerCase().trim()
            const targetCityName = cityName.toLowerCase().trim()
            const matches = listingCityName?.includes(targetCityName) || targetCityName.includes(listingCityName || '')
            if (matches) {
              console.log('API fallback - Found partial matching listing:', listing.business, 'in city:', listing.cities?.name)
            }
            return matches
          })
        }
        
        totalListings = listings.length
        featuredListings = listings.filter((listing: Listing) => listing.featured).length
        console.log('API fallback listings successful:', { totalListings, featuredListings, cityName })
        console.log('API fallback found listings:', listings.map((l: Listing) => ({ business: l.business, city: l.cities?.name })))
      }
    }
  } catch (error) {
    console.error('Error fetching listings:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": `${siteConfig.niche}s in ${cityName}`,
            "description": `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
            "url": `${siteConfig.siteUrl}/city/${slug}`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": cityName,
              "addressCountry": "US"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.5",
              "reviewCount": totalListings
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free directory listing"
            }
          })
        }}
      />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Home
            </Link>
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white text-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {siteConfig.niche}s {cityName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            Discover {totalListings} {siteConfig.niche.toLowerCase()}s in {cityName}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalListings}</div>
              <div className="text-gray-600">Total {siteConfig.niche}s</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{featuredListings}</div>
              <div className="text-gray-600">Featured</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">1</div>
              <div className="text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      {listings.length > 0 ? (
        <>
          {/* Featured Listings Section */}
          {listings.filter(listing => listing.featured).length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Featured {siteConfig.niche}s in {cityName}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listings.filter(listing => listing.featured).slice(0, 3).map((listing) => (
                    <div key={listing.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-yellow-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{listing.business}</h3>
                        <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⭐ Featured
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {listing.category && (
                          <p><span className="font-medium">Category:</span> {listing.category}</p>
                        )}
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
          )}

          {/* All Listings Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">
                All {siteConfig.niche}s in {cityName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((listing) => (
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
                    {listing.category && (
                      <p><span className="font-medium">Category:</span> {listing.category}</p>
                    )}
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
                        ({listing.number_of_reviews} reviews)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </>
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">No {siteConfig.niche}s Yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              {siteConfig.niche}s will appear here once they are added to {cityName}.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homepage
            </Link>
          </div>
        </section>
      )}

      {/* Back to Home */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Link>
        </div>
      </section>
    </div>
  )
}
