import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { siteConfig } from '@/lib/config'

interface StatePageProps {
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

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { slug } = await params
  const stateName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    title: `${siteConfig.niche}s ${stateName} | ${siteConfig.siteName}`,
    description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}. Discover top-rated ${siteConfig.niche.toLowerCase()}s, read reviews, and get contact information.`,
    keywords: `${siteConfig.niche.toLowerCase()}s, ${stateName}, local ${siteConfig.niche.toLowerCase()}s, ${siteConfig.niche.toLowerCase()} directory, ${stateName} ${siteConfig.niche.toLowerCase()}s`,
    openGraph: {
      title: `${siteConfig.niche}s ${stateName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
      url: `${siteConfig.siteUrl}/state/${slug}`,
      siteName: siteConfig.siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.niche}s ${stateName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/state/${slug}`,
    },
  }
}

export default async function StatePage({ params }: StatePageProps) {
  const { slug } = await params
  const stateName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  console.log('=== STATE PAGE DEBUG ===')
  console.log('URL slug:', slug)
  console.log('Parsed state name:', stateName)
  
  // Fetch listings for this state
  let listings: Listing[] = []
  let totalListings = 0
  let featuredListings = 0
  let cities: string[] = []
  
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
      console.log('Looking for state name:', stateName)
      console.log('All unique state names in listings:', [...new Set(allListings.map((l: Listing) => l.cities?.states?.name).filter(Boolean))])
      
      // Filter listings for this state
      listings = allListings.filter((listing: Listing) => {
        const listingStateName = listing.cities?.states?.name?.toLowerCase().trim()
        const targetStateName = stateName.toLowerCase().trim()
        const matches = listingStateName === targetStateName
        if (matches) {
          console.log('Found matching listing:', listing.business, 'in state:', listing.cities?.states?.name)
        }
        return matches
      })
      
      // Get unique cities in this state
      cities = [...new Set(listings.map((l: Listing) => l.cities?.name).filter(Boolean))] as string[]
      
      totalListings = listings.length
      featuredListings = listings.filter((listing: Listing) => listing.featured).length
      console.log('Supabase listings fetch successful:', { totalListings, featuredListings, stateName, cities })
      console.log('Found listings:', listings.map((l: Listing) => ({ business: l.business, city: l.cities?.name, state: l.cities?.states?.name })))
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
        console.log('API fallback - Looking for state name:', stateName)
        console.log('API fallback - All unique state names in listings:', [...new Set(apiListings.map((l: Listing) => l.cities?.states?.name).filter(Boolean))])
        
        // Filter listings for this state
        listings = apiListings.filter((listing: Listing) => {
          const listingStateName = listing.cities?.states?.name?.toLowerCase().trim()
          const targetStateName = stateName.toLowerCase().trim()
          const matches = listingStateName === targetStateName
          if (matches) {
            console.log('API fallback - Found matching listing:', listing.business, 'in state:', listing.cities?.states?.name)
          }
          return matches
        })
        
        // Get unique cities in this state
        cities = [...new Set(listings.map((l: Listing) => l.cities?.name).filter(Boolean))] as string[]
        
        totalListings = listings.length
        featuredListings = listings.filter((listing: Listing) => listing.featured).length
        console.log('API fallback listings successful:', { totalListings, featuredListings, stateName, cities })
        console.log('API fallback found listings:', listings.map((l: Listing) => ({ business: l.business, city: l.cities?.name, state: l.cities?.states?.name })))
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
            "name": `${siteConfig.niche}s in ${stateName}`,
            "description": `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
            "url": `${siteConfig.siteUrl}/state/${slug}`,
            "address": {
              "@type": "PostalAddress",
              "addressRegion": stateName,
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
            {siteConfig.niche}s {stateName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600">
            Discover {totalListings} {siteConfig.niche.toLowerCase()}s in {stateName}
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
              <div className="text-3xl font-bold text-purple-600">{cities.length}</div>
              <div className="text-gray-600">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      {cities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Cities in {stateName}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cities.map((city) => (
                <Link
                  key={city}
                  href={`/city/${city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-4 py-3 rounded-lg text-center transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Listings Section */}
      {listings.length > 0 ? (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              {siteConfig.niche}s in {stateName}
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
                    {listing.cities?.name && (
                      <p><span className="font-medium">City:</span> {listing.cities.name}</p>
                    )}
                    {listing.category && (
                      <p><span className="font-medium">Category:</span> {listing.category}</p>
                    )}
                    {listing.address && (
                      <p><span className="font-medium">Address:</span> {listing.address}</p>
                    )}
                    {listing.phone && (
                      <p><span className="font-medium">Phone:</span> {listing.phone}</p>
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
      ) : (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">No {siteConfig.niche}s Yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              {siteConfig.niche}s will appear here once they are added to {stateName}.
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
