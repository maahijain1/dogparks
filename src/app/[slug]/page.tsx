import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Phone, Globe } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/dynamic-config'
import CitySearch from '@/components/CitySearch'
import ArticleRenderer from '@/components/ArticleRenderer'

// Function to clean article content and remove empty heading tags
function cleanArticleContent(content: string): string {
  if (!content || typeof content !== 'string') return ''
  
  try {
    // Remove empty heading tags (h1, h2, h3, h4, h5, h6) that have no content or only whitespace
    return content
      .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '') // Remove empty heading tags
      .replace(/<h[1-6][^>]*>\s*&nbsp;\s*<\/h[1-6]>/gi, '') // Remove heading tags with only &nbsp;
      .replace(/<h[1-6][^>]*>\s*<br\s*\/?>\s*<\/h[1-6]>/gi, '') // Remove heading tags with only <br>
      .replace(/<h[1-6][^>]*>\s*<p>\s*<\/p>\s*<\/h[1-6]>/gi, '') // Remove heading tags with empty paragraphs
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim()
  } catch (error) {
    return content || ''
  }
}

// Function to strip HTML tags for meta descriptions
function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  try {
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
  } catch (error) {
    return html || ''
  }
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
        description: article.excerpt || (article.content ? stripHtmlTags(article.content || '').substring(0, 160) : 'No description available'),
        keywords: `${niche.toLowerCase()}s, article, ${article.title}`,
        openGraph: {
          title: article.title,
          description: article.excerpt || (article.content ? stripHtmlTags(article.content || '').substring(0, 160) : 'No description available'),
          url: `${siteConfig.siteUrl}/${slug}`,
          siteName: siteName,
          type: 'article',
          images: article.featured_image ? [{ url: article.featured_image }] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.excerpt || (article.content ? stripHtmlTags(article.content || '').substring(0, 160) : 'No description available'),
        },
        alternates: {
          canonical: `${siteConfig.siteUrl}/${slug}`,
        },
      }
    }
  } catch (error) {
    // Continue to other checks
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
  
  // City pages are now handled by /city/[slug] route
  // This route only handles articles and state pages
  
  return {
    title: `${siteName}`,
    description: `Find the best ${niche.toLowerCase()}s in your area`,
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params
  
  // Get dynamic settings with error handling
  let settings
  try {
    settings = await getSiteSettings()
  } catch {
    settings = { niche: 'Dog Park' }
  }
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
    if (error) {
      try {
        const apiResponse = await fetch('/api/articles?published=true', {
          cache: 'no-store'
        })
        if (apiResponse.ok) {
          const articles = await apiResponse.json()
          article = articles.find((a: { slug: string }) => a.slug === slug)
          articleError = null
        }
      } catch {
        // API fallback failed, continue with error
      }
    }
    
    if (article && !articleError) {
      // This is an article page - with full width styling
      return (
        <div className="min-h-screen bg-white">
          {/* Full width container */}
          <div className="w-full">
            {/* Back to Home Button */}
            <div className="px-4 py-6 bg-gray-50 border-b">
              <div className="max-w-7xl mx-auto">
                <Link 
                  href="/"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Homepage
                </Link>
              </div>
            </div>
            
            {/* Article Header */}
            <div className="px-4 py-8 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{article.title}</h1>
                <div className="text-sm text-gray-600">
                  Published on {new Date(article.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
            
            {/* Featured Image - Full Width */}
            {article.featured_image ? (
              <div className="w-full mb-8">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  width={1200}
                  height={600}
                  className="w-full h-64 md:h-96 object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            ) : null}
            
            {/* Article Content - Full Width with proper HTML rendering */}
            <div className="w-full">
              <ArticleRenderer content={cleanArticleContent(article?.content || '') || '<p>No content available.</p>'} />
            </div>
          </div>
        </div>
      )
    }
    
    // If no article found, continue to check for state/city pages
  } catch (error) {
    // Error fetching article - return 404
    return notFound()
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
  // Only treat as state page if it matches the niche pattern exactly
  if (slug.includes('-') && parts.length >= 3 && 
      parts.slice(0, nicheParts.length).join('-') === nicheSlug &&
      !slug.startsWith('how-') && !slug.startsWith('what-') && !slug.startsWith('why-') && 
      !slug.startsWith('when-') && !slug.startsWith('where-') && !slug.startsWith('which-')) {
    // This is a state page like {niche}-{state}
    let stateName = parts.slice(nicheParts.length).join('-').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    // Clean up parentheses and extra spaces
    stateName = stateName.replace(/\s*\([^)]*\)\s*/g, '').trim()
    
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
        const { data: stateDataCI, error: stateErrorCI } = await supabase
          .from('states')
          .select('id, name')
          .ilike('name', `%${stateName}%`)
          .limit(1)
          .single()
        
        if (!stateErrorCI && stateDataCI) {
          stateData = stateDataCI
          stateError = null
        }
      }
      
      if (stateError || !stateData) {
        
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
      
      
      // Then get cities in this state using state_id
      const { data: stateCities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', stateData.id)
      
      if (!citiesError) {
        
        if (stateCities && stateCities.length > 0) {
          cities = stateCities.map(city => ({
            id: city.id,
            name: city.name
          }))
        } else {
          // No cities found for this state
        }
      }

      // Fetch all listings from all cities in this state
      if (stateData) {
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
        } else {
          stateListings = listings || []
        }
      }
    } catch (error) {
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
            
            {/* City Search Bar */}
            {cities.length > 0 && <CitySearch cities={cities} />}
            
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
                  .slice(0, 3)
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {cities
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((city) => (
                    <Link
                      key={city.id}
                      href={`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="group relative bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-center hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                      data-city-name={city.name}
                    >
                      <div className="flex items-center justify-center min-h-[2.5rem]">
                        <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm leading-tight">
                          {city.name}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
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
  
  // City pages are now handled by /city/[slug] route
  // This route only handles articles and state pages

  notFound()
}