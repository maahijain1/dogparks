import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

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
  
  // Handle state pages (format: arkansas)
  if (!slug.includes('-')) {
    const stateName = slug.replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: `${siteConfig.niche}s ${stateName} | ${siteConfig.siteName}`,
      description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}. Discover top-rated ${siteConfig.niche.toLowerCase()}s, read reviews, and get contact information.`,
      keywords: `${siteConfig.niche.toLowerCase()}s, ${stateName}, local ${siteConfig.niche.toLowerCase()}s, ${siteConfig.niche.toLowerCase()} directory, ${stateName} ${siteConfig.niche.toLowerCase()}s`,
      openGraph: {
        title: `${siteConfig.niche}s ${stateName}`,
        description: `Find the best ${siteConfig.niche.toLowerCase()}s in ${stateName}`,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteConfig.siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${siteConfig.niche}s ${stateName}`,
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
  let article: Article | null = null
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
      // This is an article page
      return (
        <div className="min-h-screen bg-white">
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "description": article.excerpt || article.content.substring(0, 160),
                "image": article.featured_image,
                "datePublished": article.created_at,
                "author": {
                  "@type": "Organization",
                  "name": siteConfig.siteName
                },
                "publisher": {
                  "@type": "Organization",
                  "name": siteConfig.siteName,
                  "logo": {
                    "@type": "ImageObject",
                    "url": `${siteConfig.siteUrl}/logo.png`
                  }
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

          {/* Article Content */}
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-6">
                  {article.excerpt}
                </p>
              )}
              {article.featured_image && (
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 overflow-hidden">
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', article?.featured_image)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </header>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

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
  } catch (error) {
    console.error('Error fetching article:', error)
  }
  
  // If not an article, check if it's a state or city page
  const parts = slug.split('-')
  
  // Handle state pages (format: dog-park-arizona) - show state with cities
  if (slug.includes('-') && parts.length >= 3 && parts[0] === 'dog' && parts[1] === 'park') {
    // This is a state page like dog-park-arizona
    const stateName = parts.slice(2).join('-').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    console.log('=== STATE PAGE ===')
    console.log('URL slug:', slug)
    console.log('State name:', stateName)
    console.log('Looking for cities in state:', stateName)
    
    // Fetch cities and listings for this state
    let cities: Array<{id: string, name: string}> = []
    let totalListings = 0
    let featuredListings = 0
    
    try {
      // First, get the state ID
      const { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('id, name')
        .eq('name', stateName)
        .single()
      
      if (stateError || !stateData) {
        console.log('State not found:', stateName, stateError)
        return notFound()
      }
      
      console.log('Found state:', stateData)
      
      // Then get cities in this state using state_id
      const { data: stateCities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('state_id', stateData.id)
      
      if (!citiesError && stateCities) {
        console.log('Raw state cities data:', stateCities)
        cities = stateCities.map(city => ({
          id: city.id,
          name: city.name
        }))
        console.log('Found cities in state:', cities.map(c => c.name))
        console.log('Cities count:', cities.length)
        
        // Get listings for these cities
        const cityIds = cities.map(c => c.id)
        const { data: stateListings, error: listingsError } = await supabase
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
          .in('city_id', cityIds)
          .order('featured', { ascending: false })
          .order('business')
        
        if (!listingsError && stateListings) {
          totalListings = stateListings.length
          featuredListings = stateListings.filter((listing: {featured: boolean}) => listing.featured).length
          console.log('Found listings in state:', { totalListings, featuredListings })
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
        {cities.length > 0 ? (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12">
                Cities in {stateName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cities.map((city) => (
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
        ) : (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-8">No Cities Yet</h2>
              <p className="text-xl text-gray-600 mb-8">
                Cities will appear here once they are added to {stateName}.
              </p>
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
  
  // Handle city pages (format: dog-park-fort-smith) - redirect to proper city URL
  if (slug.includes('-') && parts.length > 2 && parts[0] === 'dog' && parts[1] === 'park') {
    // This is a city page like dog-park-fort-smith
    console.log('URL parts:', parts)
    // Remove the first two parts (dog-park) and join the rest to get the full city name
    const cityParts = parts.slice(2) // Remove first two parts (dog-park)
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