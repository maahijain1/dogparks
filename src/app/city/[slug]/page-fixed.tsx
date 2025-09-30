import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { Listing, City, State } from '@/types/database'
import { MapPin, Star, Phone, Globe, Mail, Clock } from 'lucide-react'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/dynamic-config'

interface CityPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params
  const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Get dynamic settings
  const settings = await getSiteSettings()
  const siteName = settings.site_name || 'DirectoryHub'
  const niche = settings.niche || 'Dog Park'
  
  return {
    title: `${cityName} ${niche}s | ${siteName}`,
    description: `Find the best ${niche.toLowerCase()}s in ${cityName}. Browse reviews, ratings, and contact information for local businesses.`,
    openGraph: {
      title: `${cityName} ${niche}s | ${siteName}`,
      description: `Find the best ${niche.toLowerCase()}s in ${cityName}. Browse reviews, ratings, and contact information for local businesses.`,
    },
  }
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params
  const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  console.log('=== CITY PAGE DEBUG ===')
  console.log('URL slug:', slug)
  console.log('Parsed city name:', cityName)
  
  // Get dynamic settings
  const settings = await getSiteSettings()
  const siteName = settings.site_name || 'DirectoryHub'
  const niche = settings.niche || 'Dog Park'
  const country = settings.country || 'USA'
  
  // Fetch listings for this city
  let listings: Listing[] = []
  let totalListings = 0
  let featuredListings = 0
  let cityData: City | null = null
  let stateData: State | null = null
  
  try {
    // First, get the city by slug to get the proper city ID
    const { data: cityResult, error: cityError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        slug,
        states (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .single()

    if (cityError || !cityResult) {
      console.log('City not found by slug, trying name matching...')
      // Fallback: try to find city by name
      const { data: cityByName, error: cityByNameError } = await supabase
        .from('cities')
        .select(`
          id,
          name,
          slug,
          states (
            id,
            name,
            slug
          )
        `)
        .ilike('name', `%${cityName}%`)
        .limit(1)
        .single()

      if (cityByNameError || !cityByName) {
        console.log('City not found by name either:', cityName)
        listings = []
        totalListings = 0
        featuredListings = 0
      } else {
        cityData = cityByName
        stateData = cityByName.states
        console.log('Found city by name:', cityByName.name, 'ID:', cityByName.id)
        
        // Now get listings for this specific city ID
        const { data: cityListings, error: listingsError } = await supabase
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
          .eq('city_id', cityByName.id)
          .order('featured', { ascending: false })
          .order('business')
        
        if (!listingsError && cityListings) {
          listings = cityListings
          totalListings = listings.length
          featuredListings = listings.filter((listing: Listing) => listing.featured).length
          console.log('Found listings for city ID:', cityByName.id, { totalListings, featuredListings })
        }
      }
    } else {
      // Use the city found by slug
      cityData = cityResult
      stateData = cityResult.states
      console.log('Found city by slug:', cityResult.name, 'ID:', cityResult.id)
      
      // Get listings for this specific city ID
      const { data: cityListings, error: listingsError } = await supabase
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
        .eq('city_id', cityResult.id)
        .order('featured', { ascending: false })
        .order('business')
      
      if (!listingsError && cityListings) {
        listings = cityListings
        totalListings = listings.length
        featuredListings = listings.filter((listing: Listing) => listing.featured).length
        console.log('Found listings for city ID:', cityResult.id, { totalListings, featuredListings })
      } else {
        console.log('Error fetching listings:', listingsError)
      }
    }
  } catch (error) {
    console.error('Error fetching city data:', error)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {cityData?.name || cityName} {niche}s
            </h1>
            {stateData && (
              <p className="text-xl text-gray-600 mb-4">
                {cityData?.name}, {stateData.name}
              </p>
            )}
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {totalListings} {totalListings === 1 ? 'Business' : 'Businesses'}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {featuredListings} Featured
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No {niche.toLowerCase()}s found in {cityData?.name || cityName}
              </h2>
              <p className="text-gray-600 mb-6">
                We don't have any {niche.toLowerCase()}s listed for {cityData?.name || cityName} yet.
              </p>
              <Link
                href="/get-featured"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your {niche}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Listings */}
            {featuredListings > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured {niche}s</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listings
                    .filter(listing => listing.featured)
                    .map((listing) => (
                      <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">{listing.business}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {listing.address && (
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{listing.address}</span>
                              </div>
                            )}
                            
                            {listing.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <a href={`tel:${listing.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                                  {listing.phone}
                                </a>
                              </div>
                            )}
                            
                            {listing.website && (
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                <a 
                                  href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                            
                            {listing.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <a href={`mailto:${listing.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                                  {listing.email}
                                </a>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium text-gray-900">
                                  {listing.review_rating || 0}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">
                                  ({listing.number_of_reviews || 0} reviews)
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">{listing.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* All Listings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All {niche}s in {cityData?.name || cityName}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{listing.business}</h3>
                        {listing.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {listing.address && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{listing.address}</span>
                          </div>
                        )}
                        
                        {listing.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <a href={`tel:${listing.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                              {listing.phone}
                            </a>
                          </div>
                        )}
                        
                        {listing.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-2" />
                            <a 
                              href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        
                        {listing.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <a href={`mailto:${listing.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                              {listing.email}
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {listing.review_rating || 0}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({listing.number_of_reviews || 0} reviews)
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{listing.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
