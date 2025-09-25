import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

interface City {
  id: string
  name: string
  states?: {
    name: string
  }
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
  city_id: string
  featured: boolean
  cities?: {
    name: string
  }
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  
  // First check if this is an article
  let article = null
  let articleError = null
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()
    
    article = data
    articleError = error
    
    console.log('Metadata - Looking for slug:', slug)
    console.log('Metadata - Found article:', article)
    console.log('Metadata - Error:', articleError)
    
    // If Supabase fails, try API fallback
    if (error && process.env.NEXT_PUBLIC_SITE_URL) {
      console.log('Metadata - Supabase failed, trying API fallback...')
      try {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/articles`, {
          cache: 'no-store'
        })
        if (apiResponse.ok) {
          const articles = await apiResponse.json()
          article = articles.find((a: { slug: string }) => a.slug === slug)
          articleError = null
          console.log('Metadata - API fallback found article:', article)
        }
      } catch (apiError) {
        console.log('Metadata - API fallback also failed:', apiError)
      }
    }
    
    if (article && !articleError) {
        return {
          title: `${article.title} | ${siteConfig.siteName}`,
          description: article.excerpt || `Read about ${article.title} on ${siteConfig.siteName}`,
          keywords: `${siteConfig.niche.toLowerCase()}s, ${article.title}, ${siteConfig.niche.toLowerCase()} articles`,
          openGraph: {
            title: article.title,
            description: article.excerpt || `Read about ${article.title}`,
            url: `${siteConfig.siteUrl}/${slug}`,
            siteName: siteConfig.siteName,
            type: 'article',
            images: article.featured_image ? [{ url: article.featured_image }] : undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt || `Read about ${article.title}`,
            images: article.featured_image ? [article.featured_image] : undefined,
          },
          alternates: {
            canonical: `${siteConfig.siteUrl}/${slug}`,
          },
        }
      }
    } catch (error) {
      console.log('Error checking for article metadata:', error)
    }
  
  // Handle state pages (format: dog-parks-south-dakota)
  if (slug.includes('-') && slug.split('-').length >= 3) {
    const parts = slug.split('-')
    const stateParts = parts.slice(2) // Remove first two parts (dog-parks)
    const stateName = stateParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: `${siteConfig.niche} ${stateName} | ${siteConfig.siteName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}. Discover top-rated ${siteConfig.niche.toLowerCase()}s, read reviews, and get contact information.`,
      keywords: `${siteConfig.niche.toLowerCase()}s, ${stateName}, local ${siteConfig.niche.toLowerCase()}s, ${siteConfig.niche.toLowerCase()} directory, ${stateName} ${siteConfig.niche.toLowerCase()}s`,
      openGraph: {
        title: `${siteConfig.niche} ${stateName}`,
        description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteConfig.siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${siteConfig.niche} ${stateName}`,
        description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
      },
      alternates: {
        canonical: `${siteConfig.siteUrl}/${slug}`,
      },
    }
  }
  
  // Handle city pages
  if (slug.includes('-')) {
    const parts = slug.split('-')
    // Remove the first two parts (dog-park) and join the rest to get the full city name
    const cityParts = parts.slice(2) // Remove first two parts (dog-park)
    const cityName = cityParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: `${siteConfig.niche}s ${cityName} | ${siteConfig.siteName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}. Discover top-rated ${siteConfig.niche.toLowerCase()}s, read reviews, and get contact information.`,
      keywords: `${siteConfig.niche.toLowerCase()}s, ${cityName}, local ${siteConfig.niche.toLowerCase()}s, ${siteConfig.niche.toLowerCase()} directory, ${cityName} ${siteConfig.niche.toLowerCase()}s`,
      openGraph: {
        title: `${siteConfig.niche}s ${cityName}`,
        description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteConfig.siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${siteConfig.niche}s ${cityName}`,
        description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
      },
      alternates: {
        canonical: `${siteConfig.siteUrl}/${slug}`,
      },
    }
  }
  
  return {
    title: `${siteConfig.siteName}`,
    description: siteConfig.siteDescription,
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  
  // First check if this is an article by trying to fetch it
  let article = null
  let articleError = null
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()
    
    article = data
    articleError = error
    
    console.log('Looking for slug:', slug)
    console.log('Found article:', article)
    console.log('Error:', articleError)
    console.log('Supabase connection test:', supabase)
    
    // If Supabase fails, try API fallback
    if (error && process.env.NEXT_PUBLIC_SITE_URL) {
      console.log('Supabase failed, trying API fallback...')
      try {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/articles`, {
          cache: 'no-store'
        })
        if (apiResponse.ok) {
          const articles = await apiResponse.json()
          article = articles.find((a: { slug: string }) => a.slug === slug)
          articleError = null
          console.log('API fallback found article:', article)
        }
      } catch (apiError) {
        console.log('API fallback also failed:', apiError)
      }
    }
    
    if (article && !articleError) {
        // This is an article, render it
        return (
          <div className="min-h-screen bg-white">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <Link href="/" className="text-2xl font-bold text-blue-600">
                    {siteConfig.siteName}
                  </Link>
                  <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </div>
              </div>
            </nav>

            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
                {article.featured_image && (
                  <Image 
                    src={article.featured_image} 
                    alt={article.title}
                    width={800}
                    height={256}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
              </header>
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>
          </div>
        )
      }
    } catch (error) {
      console.log('Error checking for article:', error)
    }
  
  // Handle state pages (format: dog-parks-south-dakota)
  if (slug.includes('-') && slug.split('-').length >= 3) {
    // Extract state name by removing the niche part (first two parts: dog-parks)
    const parts = slug.split('-')
    const stateParts = parts.slice(2) // Remove first two parts (dog-parks)
    const stateName = stateParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    
    // Fetch cities and listings for this state with fallback
    let cities = []
    let allListings = []
    
    try {
      // Try Supabase first
      const [citiesResult, listingsResult] = await Promise.all([
        supabase
          .from('cities')
          .select(`
            *,
            states (
              id,
              name
            )
          `),
        supabase
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
      ])
      
      if (!citiesResult.error && citiesResult.data) {
        cities = citiesResult.data.filter((city: City) => 
          city.states?.name?.toLowerCase() === stateName.toLowerCase()
        )
        console.log('Supabase cities fetch successful:', cities.length)
      }
      
      if (!listingsResult.error && listingsResult.data) {
        allListings = listingsResult.data
        console.log('Supabase listings fetch successful:', allListings.length)
      }
      
      // If Supabase fails, try API fallback
      if (citiesResult.error || listingsResult.error) {
        console.log('Supabase failed, trying API fallback...', { citiesError: citiesResult.error, listingsError: listingsResult.error })
        
        const [citiesRes, listingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/cities`, {
            cache: 'no-store'
          }),
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/listings`, {
            cache: 'no-store'
          })
        ])
        
        if (citiesRes.ok) {
          const response = await citiesRes.json()
          const allCities = response.value || response // Handle both wrapped and direct responses
          cities = allCities.filter((city: City) => 
            city.states?.name?.toLowerCase() === stateName.toLowerCase()
          )
          console.log('API fallback cities successful:', cities.length)
        }
        
        if (listingsRes.ok) {
          const response = await listingsRes.json()
          allListings = response.value || response // Handle both wrapped and direct responses
          console.log('API fallback listings successful:', allListings.length)
        }
      }
    } catch (error) {
      console.error('Error fetching state data:', error)
    }
    
    return (
      <div className="min-h-screen bg-white">
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
              {siteConfig.niche} {stateName}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Explore {siteConfig.niche.toLowerCase()}s in {stateName}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">{cities.length}</div>
                <div className="text-sm text-gray-600">Cities</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">
                  {allListings.filter((listing: Listing) => 
                    cities.some((city: City) => city.id === listing.city_id)
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Total {siteConfig.niche}s</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">
                  {allListings.filter((listing: Listing) => 
                    listing.featured && cities.some((city: City) => city.id === listing.city_id)
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        {cities.length > 0 ? (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Cities in {stateName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city: City) => {
                  const cityListings = allListings.filter((listing: Listing) => listing.city_id === city.id)
                  const featuredCount = cityListings.filter((listing: Listing) => listing.featured).length
                  
                  return (
                    <Link
                      key={city.id}
                      href={`/${siteConfig.niche.toLowerCase().replace(/\s+/g, '-')}-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                          <MapPin className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {city.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {cityListings.length} {siteConfig.niche.toLowerCase()}{cityListings.length !== 1 ? 's' : ''}
                        </p>
                        {featuredCount > 0 && (
                          <div className="bg-yellow-100 group-hover:bg-yellow-200 rounded-full px-3 py-1 text-sm font-medium text-yellow-800 group-hover:text-yellow-900 transition-colors">
                            {featuredCount} Featured
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Cities Yet</h3>
              <p className="text-gray-600">Cities will appear here once they are added to {stateName}.</p>
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
  
  // Handle city pages (format: dog-park-fort-smith)
  if (slug.includes('-')) {
    // If not an article, treat as city page
    const parts = slug.split('-')
    // Remove the first two parts (dog-park) and join the rest to get the full city name
    const cityParts = parts.slice(2) // Remove first two parts (dog-park)
    const cityName = cityParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    
    // Fetch listings from API with fallback
    let listings = []
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
        // Filter listings for this city
        listings = allListings.filter((listing: Listing) => 
          listing.cities?.name?.toLowerCase() === cityName.toLowerCase()
        )
        
        totalListings = listings.length
        featuredListings = listings.filter((listing: Listing) => listing.featured).length
        console.log('Supabase listings fetch successful:', { totalListings, featuredListings })
      } else {
        console.log('Supabase listings failed, trying API fallback...', listingsError)
        
        // Fallback to API
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/listings`, {
          cache: 'no-store' // Always fetch fresh data
        })
        if (response.ok) {
          const responseData = await response.json()
          const apiListings = responseData.value || responseData // Handle both wrapped and direct responses
          
          // Filter listings for this city
          listings = apiListings.filter((listing: Listing) => 
            listing.cities?.name?.toLowerCase() === cityName.toLowerCase()
          )
          
          totalListings = listings.length
          featuredListings = listings.filter((listing: Listing) => listing.featured).length
          console.log('API fallback listings successful:', { totalListings, featuredListings })
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    }
    
    return (
      <div className="min-h-screen bg-white">
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": `${siteConfig.niche}s in ${cityName}`,
              "description": `Find the best ${siteConfig.niche.toLowerCase()}s in ${cityName}`,
              "url": `${siteConfig.siteUrl}/${slug}`,
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
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">{totalListings}</div>
                <div className="text-sm text-gray-600">Total {siteConfig.niche}s</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">{new Set(listings.map((l: Listing) => l.category)).size}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="text-3xl font-bold mb-2 text-gray-900">{featuredListings}</div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
            </div>
          </div>
        </section>

        {/* Listings */}
        {totalListings > 0 ? (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {siteConfig.niche}s in {cityName}
              </h2>
              
              {/* Featured Listings */}
              {featuredListings > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    ⭐ Featured {siteConfig.niche}s
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.filter((listing: Listing) => listing.featured).map((listing: Listing) => (
                      <div key={listing.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-lg p-6 border-2 border-yellow-300 relative">
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ FEATURED
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {listing.business || `${siteConfig.niche} - ${cityName}`}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">{listing.address}</p>
                          <div className="space-y-2">
                            {listing.phone && (
                              <a 
                                href={`tel:${listing.phone}`}
                                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                              >
                                📞 Call Now
                              </a>
                            )}
                            {listing.website && (
                              <a 
                                href={listing.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
                              >
                                🌐 Visit Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Listings */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  All {siteConfig.niche}s in {cityName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing: Listing) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {listing.business || `${siteConfig.niche} - ${cityName}`}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">{listing.address}</p>
                        <div className="space-y-2">
                          {listing.phone && (
                            <a 
                              href={`tel:${listing.phone}`}
                              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                            >
                              📞 Call
                            </a>
                          )}
                          {listing.website && (
                            <a 
                              href={listing.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                            >
                              🌐 Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {siteConfig.niche}s Yet</h3>
              <p className="text-gray-600">{siteConfig.niche}s will appear here once they are added to {cityName}.</p>
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

  notFound()
}
