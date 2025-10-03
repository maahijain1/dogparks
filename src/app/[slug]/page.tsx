import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/dynamic-config'

// Function to clean article content and remove empty heading tags
function cleanArticleContent(content: string): string {
  if (!content) return ''
  
  // Remove empty heading tags (h1, h2, h3, h4, h5, h6) that have no content or only whitespace
  return content
    .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '') // Remove empty heading tags
    .replace(/<h[1-6][^>]*>\s*&nbsp;\s*<\/h[1-6]>/gi, '') // Remove heading tags with only &nbsp;
    .replace(/<h[1-6][^>]*>\s*<br\s*\/?>\s*<\/h[1-6]>/gi, '') // Remove heading tags with only <br>
    .replace(/<h[1-6][^>]*>\s*<p>\s*<\/p>\s*<\/h[1-6]>/gi, '') // Remove heading tags with empty paragraphs
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim()
}

interface SlugPageProps {
  params: Promise<{ slug: string }>
}


interface Article {
  id: string
  title: string
  content: string
  slug: string
  featured_image?: string
  excerpt?: string
  published: boolean
  created_at: string
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  
  // Get dynamic settings
  const settings = await getSiteSettings()
  const siteName = settings.site_name || 'DirectoryHub'
  const niche = settings.niche || 'Dog Park'
  
  // First, check if this is an article
  try {
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (article && !articleError) {
      return {
        title: `${article.title} | ${siteName}`,
        description: article.excerpt || (article.content ? article.content.substring(0, 160) : 'No description available'),
        keywords: `${niche.toLowerCase()}s, article, ${article.title}`,
        openGraph: {
          title: article.title,
          description: article.excerpt || (article.content ? article.content.substring(0, 160) : 'No description available'),
          url: `${siteConfig.siteUrl}/${slug}`,
          siteName: siteName,
          type: 'article',
          images: article.featured_image ? [{ url: article.featured_image }] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.excerpt || (article.content ? article.content.substring(0, 160) : 'No description available'),
        },
        alternates: {
          canonical: `${siteConfig.siteUrl}/${slug}`,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching article for metadata:', error)
  }
  
  // Handle state pages (format: arkansas)
  if (!slug.includes('-')) {
    const stateName = slug.replace(/\b\w/g, l => l.toUpperCase())
    // Format: "Niche State"
    const title = `${niche} ${stateName}`
    const description = `Find the best ${niche.toLowerCase()} in ${stateName}. Discover top-rated ${niche.toLowerCase()}, read reviews, and get contact information.`
    
    return {
      title: title,
      description: description,
      keywords: `${niche.toLowerCase()}, ${stateName}, local ${niche.toLowerCase()}, ${niche.toLowerCase()} directory, ${stateName} ${niche.toLowerCase()}`,
      openGraph: {
        title: title,
        description: description,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
      },
      alternates: {
        canonical: `${siteConfig.siteUrl}/${slug}`,
      },
    }
  }
  
  // Handle city pages
  if (slug.includes('-')) {
    const parts = slug.split('-')
    
    // Get current niche setting
    const { data: nicheData } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'niche')
      .single()
    
    const currentNiche = nicheData?.setting_value || 'Dog Park'
    const nicheSlug = currentNiche.toLowerCase().replace(/\s+/g, '-')
    const nicheParts = nicheSlug.split('-')
    
    // Remove the niche parts and join the rest to get the full city name
    const cityParts = parts.slice(nicheParts.length)
    const cityName = cityParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: `${currentNiche}s ${cityName} | ${siteName}`,
      description: `Find the best ${currentNiche.toLowerCase()}s in ${cityName}. Discover top-rated ${currentNiche.toLowerCase()}s, read reviews, and get contact information.`,
      keywords: `${currentNiche.toLowerCase()}s, ${cityName}, local ${currentNiche.toLowerCase()}s, ${currentNiche.toLowerCase()} directory, ${cityName} ${currentNiche.toLowerCase()}s`,
      openGraph: {
        title: `${currentNiche}s ${cityName}`,
        description: `Find the best ${currentNiche.toLowerCase()}s in ${cityName}`,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${currentNiche}s ${cityName}`,
        description: `Find the best ${currentNiche.toLowerCase()}s in ${cityName}`,
      },
      alternates: {
        canonical: `${siteConfig.siteUrl}/${slug}`,
      },
    }
  }
  
  return {
    title: `${siteName}`,
    description: `Find the best ${niche.toLowerCase()}s in your area`,
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  
  // Get dynamic settings
  const settings = await getSiteSettings()
  const niche = settings.niche || 'Dog Park'
  
  // First check if this is an article by trying to fetch it
  let article: Article | null = null
  let articleError = null
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    
    article = data
    articleError = error
    
    
    // If Supabase fails, try API fallback
    if (error && process.env.NEXT_PUBLIC_SITE_URL) {
      try {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/articles`, {
          cache: 'no-store'
        })
        if (apiResponse.ok) {
          const articles = await apiResponse.json()
          article = articles.find((a: { slug: string }) => a.slug === slug)
          articleError = null
        }
      } catch {
      }
    }
    
    
    if (article && !articleError) {
      // This is an article page - with basic styling
      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Back to Home Button */}
            <div className="mb-8">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </div>
            
            <h1 className="text-4xl font-bold mb-8">{article.title}</h1>
            
            {/* Featured Image */}
            {article.featured_image ? (
              <div className="mb-8">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  quality={90}
                />
              </div>
            ) : (
              <div className="mb-8 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                No featured image available
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none prose-p:mb-6 prose-headings:mb-4 prose-headings:mt-8 prose-h2:text-2xl prose-h3:text-xl prose-h2:font-bold prose-h3:font-semibold prose-strong:font-bold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
              dangerouslySetInnerHTML={{ __html: cleanArticleContent(article.content || '') }}
            />
          </div>
        </div>
      )
    }
  } catch {
    // Error fetching article
  }
  
  
  // If not an article, check if it's a state or city page
  const parts = slug.split('-')
  
  // Get current niche setting to determine state page pattern
  const { data: nicheData } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'niche')
    .single()
  
  const currentNiche = nicheData?.setting_value || 'Dog Park'
  const nicheSlug = currentNiche.toLowerCase().replace(/\s+/g, '-')
  const nicheParts = nicheSlug.split('-')
  
  
  // Handle state pages (format: {niche}-{state}) - show state with cities
  if (slug.includes('-') && parts.length >= 3 && 
      parts.slice(0, nicheParts.length).join('-') === nicheSlug) {
    // This is a state page like {niche}-{state}
    let stateName = parts.slice(nicheParts.length).join('-').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    // Clean up parentheses and extra spaces
    stateName = stateName.replace(/\s*\([^)]*\)\s*/g, '').trim()
    
    console.log('=== STATE PAGE DEBUG ===')
    console.log('URL slug:', slug)
    console.log('Niche slug:', nicheSlug)
    console.log('Niche parts:', nicheParts)
    console.log('URL parts:', parts)
    console.log('Original state name:', parts.slice(nicheParts.length).join('-'))
    console.log('Cleaned state name:', stateName)
    console.log('Looking for cities in state:', stateName)
    
    // Fetch cities for this state and listings
    let cities: Array<{id: string, name: string}> = []
    let stateListings: Array<{
      id: string
      business: string
      featured: boolean
      review_rating: number | string
      address?: string
      phone?: string
      website?: string
      cities?: { name: string }
    }> = []
    
    try {
      // First, try exact match
      let { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('id, name')
        .eq('name', stateName)
        .single()
      
      // If exact match fails, try case-insensitive partial match
      if (stateError || !stateData) {
        console.log('Exact match failed, trying case-insensitive search...')
        const { data: stateDataCI, error: stateErrorCI } = await supabase
          .from('states')
          .select('id, name')
          .ilike('name', `%${stateName}%`)
          .limit(1)
          .single()
        
        if (!stateErrorCI && stateDataCI) {
          stateData = stateDataCI
          stateError = null
          console.log('Found state with case-insensitive search:', stateData.name)
        }
      }
      
      if (stateError || !stateData) {
        console.log('State not found:', stateName, stateError)
        
        // Show all available states for debugging
        const { data: allStates } = await supabase
          .from('states')
          .select('name')
          .order('name')
        
        return (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">State Not Found</h1>
              <p className="text-xl text-gray-600 mb-4">
                The state &quot;{stateName}&quot; could not be found. It may have been removed from the directory.
              </p>
              {allStates && allStates.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Available states:</p>
                  <div className="text-sm text-gray-600">
                    {allStates.map(state => state.name).join(', ')}
                  </div>
                </div>
              )}
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </div>
          </div>
        )
      }
      
      console.log('Found state:', stateData)
      
      // Then get cities in this state using state_id
      const { data: stateCities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', stateData.id)
      
      if (citiesError) {
        console.error('Cities query error:', citiesError)
      } else {
        console.log('Raw state cities data:', stateCities)
        console.log('Cities data length:', stateCities?.length || 0)
        
        if (stateCities && stateCities.length > 0) {
          cities = stateCities.map(city => ({
            id: city.id,
            name: city.name
          }))
          console.log('✅ Found cities in state:', cities.map(c => c.name))
          console.log('✅ Cities count:', cities.length)
        } else {
          console.log('❌ No cities found for state_id:', stateData.id)
          
          // Debug: Check if any cities exist at all
          const { data: allCities } = await supabase
            .from('cities')
            .select('id, name, state_id')
            .limit(10)
          
          console.log('Debug - Sample cities in database:', allCities)
          console.log('Debug - Cities with matching state_id:', allCities?.filter(c => c.state_id === stateData.id))
        }
      }

      // Fetch all listings from all cities in this state
      if (stateData) {
        console.log('🔄 Fetching listings for state:', stateData.name)
        const { data: listings, error: listingsError } = await supabase
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
          .in('city_id', cities.map(city => city.id))
          .order('featured', { ascending: false })
          .order('business')

        if (listingsError) {
          console.error('❌ Error fetching state listings:', listingsError)
        } else {
          stateListings = listings || []
          console.log('✅ Fetched', stateListings.length, 'listings for state')
        }
      }
    } catch (error) {
      console.error('Error fetching state data:', error)
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
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
              {niche.endsWith('s') ? niche : niche + 's'} {stateName}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Discover {stateListings.length} {niche.toLowerCase().endsWith('s') ? niche.toLowerCase() : niche.toLowerCase() + 's'} across {cities.length} cities in {stateName}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stateListings.length}</div>
                <div className="text-gray-600">{niche.endsWith('s') ? niche : niche + 's'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{cities.length}</div>
                <div className="text-gray-600">Cities</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        {stateListings.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg mb-4">
                  <span className="text-lg font-semibold">⭐ Featured {niche.endsWith('s') ? niche : niche + 's'} in {stateName}</span>
                </div>
                <p className="text-xl text-gray-600">
                  Hand-picked premium {niche.toLowerCase().endsWith('s') ? niche.toLowerCase() : niche.toLowerCase() + 's'} that stand out from the crowd
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stateListings
                  .sort((a, b) => {
                    // Sort by featured status first, then by rating, then by review count
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    const aRating = Number(a.review_rating) || 0
                    const bRating = Number(b.review_rating) || 0
                    if (aRating !== bRating) return bRating - aRating
                    return (Number((b as { number_of_reviews?: number }).number_of_reviews) || 0) - (Number((a as { number_of_reviews?: number }).number_of_reviews) || 0)
                  })
                  .slice(0, 6)
                  .map((listing) => (
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
                      {listing.review_rating && parseFloat(listing.review_rating.toString()) > 0 && (
                        <p>
                          <span className="font-medium">Rating:</span> {listing.review_rating}/5 
                          <span className="ml-1 text-yellow-500">★</span>
                        </p>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.cities?.name}, {stateName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cities Section - After featured listings */}
        {cities.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">
                Cities in {stateName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cities
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((city) => (
                    <Link
                      key={city.id}
                      href={`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-4 py-3 rounded-lg text-center transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* All Listings Section */}
        {stateListings.length > 6 && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">
                All {niche.endsWith('s') ? niche : niche + 's'} in {stateName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stateListings
                  .sort((a, b) => {
                    // Sort by featured status first, then by rating, then by review count
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    const aRating = Number(a.review_rating) || 0
                    const bRating = Number(b.review_rating) || 0
                    if (aRating !== bRating) return bRating - aRating
                    return (Number((b as { number_of_reviews?: number }).number_of_reviews) || 0) - (Number((a as { number_of_reviews?: number }).number_of_reviews) || 0)
                  })
                  .slice(6) // Skip the first 6 (featured) listings
                  .map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{listing.business}</h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {listing.cities?.name}, {stateName}
                      </p>
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
                      
                      {listing.review_rating && parseFloat(listing.review_rating.toString()) >= 4.0 && (
                        <div className="flex items-center">
                          <span className="font-medium">Rating:</span>
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                            ⭐ {listing.review_rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
  
  // Handle city pages (format: {niche}-{city}) - redirect to proper city URL
  if (slug.includes('-') && parts.length > nicheParts.length) {
    // This is a city page like {niche}-{city}
    console.log('URL parts:', parts)
    // Remove the niche parts and join the rest to get the full city name
    const cityParts = parts.slice(nicheParts.length)
    console.log('City parts after removing niche:', cityParts)
    const cityName = cityParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
    console.log('Final city name:', cityName)
    console.log('=== REDIRECTING TO CITY PAGE ===')
    console.log('URL slug:', slug)
    console.log('Parsed city name:', cityName)
    
    // Redirect to proper city URL
    const citySlug = cityParts.join('-')
    redirect(`/city/${citySlug}`)
  }

  notFound()
}