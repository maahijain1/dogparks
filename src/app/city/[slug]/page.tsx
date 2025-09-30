import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { Listing } from '@/types/database'
import { MapPin, Star, Phone, Globe, Mail } from 'lucide-react'
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
  const niche = settings.niche || 'Dog Park'
  
  // Fetch listings for this city
  let listings: Listing[] = []
  let totalListings = 0
  let featuredListings = 0
  let cityData: { id: string; name: string } | null = null
  let stateData: { id: string; name: string } | null = null
  
  try {
    // Find city by name (the way it was working yesterday)
    console.log('Looking for city:', cityName)
    
    // Try exact name match first
    const { data: cityByName, error: nameError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (
          id,
          name
        )
      `)
      .eq('name', cityName)
      .single()

    let foundCity = null
    let foundState = null

    if (!nameError && cityByName) {
      foundCity = cityByName
      foundState = Array.isArray(cityByName.states) ? cityByName.states[0] : cityByName.states
      console.log('✅ Found city by exact name:', cityByName.name, 'ID:', cityByName.id)
    } else {
      console.log('❌ City not found by exact name, trying case-insensitive...')
      
      // Try case-insensitive partial match
      const { data: cityByPartial, error: partialError } = await supabase
        .from('cities')
        .select(`
          id,
          name,
          states (
            id,
            name
          )
        `)
        .ilike('name', `%${cityName}%`)
        .limit(1)
        .single()

      if (!partialError && cityByPartial) {
        foundCity = cityByPartial
        foundState = Array.isArray(cityByPartial.states) ? cityByPartial.states[0] : cityByPartial.states
        console.log('✅ Found city by partial match:', cityByPartial.name, 'ID:', cityByPartial.id)
      } else {
        console.log('❌ City not found by any method:', cityName)
      }
    }

    // If we found a city, get its listings
    if (foundCity) {
      cityData = foundCity
      stateData = foundState
      
      console.log('Getting listings for city ID:', foundCity.id)
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
        .eq('city_id', foundCity.id)
        .order('featured', { ascending: false })
        .order('business')
      
      if (!listingsError && cityListings) {
        listings = cityListings
        totalListings = listings.length
        featuredListings = listings.filter((listing: Listing) => listing.featured).length
        console.log('✅ Found listings for city:', foundCity.name, { totalListings, featuredListings })
      } else {
        console.log('❌ Error fetching listings:', listingsError)
        listings = []
        totalListings = 0
        featuredListings = 0
      }
    } else {
      console.log('❌ No city found, showing empty state')
      listings = []
      totalListings = 0
      featuredListings = 0
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
              {niche} {cityData?.name || cityName}
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
                No {niche} found in {cityData?.name || cityName}
                </h2>
              <p className="text-gray-600 mb-6">
                We don&apos;t have any {niche} listed for {cityData?.name || cityName} yet.
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
                <div className="text-center mb-8">
                  <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg mb-4">
                    <Star className="h-6 w-6 mr-2 fill-current" />
                    <span className="font-bold text-lg">PREMIUM FEATURED {niche.toUpperCase()}S</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured {niche}s in {cityData?.name || cityName}</h2>
                  <p className="text-gray-600">Hand-picked premium businesses that stand out from the crowd</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {listings
                    .filter(listing => listing.featured)
                    .slice(0, 3)
                    .map((listing) => (
                      <div key={listing.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-yellow-200 transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{listing.business}</h3>
                          <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            ⭐ Featured
                          </span>
                        </div>
                      
                        <div className="space-y-3 text-sm">
                          {listing.address && (
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{listing.address}</span>
                            </div>
                          )}
                            
                          {listing.phone && (
                            <div className="flex items-center justify-between bg-white/60 rounded-lg p-2 -mx-2">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-orange-500 mr-2" />
                                <span className="text-gray-700 font-medium">{listing.phone}</span>
                              </div>
                              <a 
                                href={`tel:${listing.phone}`}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                              >
                                📞 Call Now
                              </a>
                            </div>
                          )}
                            
                          {listing.website && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-orange-500 mr-2" />
                              <a 
                                href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                            
                          {listing.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-orange-500 mr-2" />
                              <a href={`mailto:${listing.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                {listing.email}
                              </a>
                            </div>
                          )}
                            
                          <div className="flex items-center justify-between pt-3 border-t border-yellow-200">
                            <div className="flex items-center">
                              <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                              <span className="text-base font-bold text-gray-900">
                                {listing.review_rating || 0}
                              </span>
                              <span className="text-sm text-gray-600 ml-1">
                                ({listing.number_of_reviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                          {listing.category && (
                            <div className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                              {listing.category}
                            </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Listings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All {niche} in {cityData?.name || cityName}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listings
                  .filter(listing => !listing.featured)
                  .map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{listing.business}</h3>
                  
                      <div className="space-y-3">
                    {listing.address && (
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{listing.address}</span>
                          </div>
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