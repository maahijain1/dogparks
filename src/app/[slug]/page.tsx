import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
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
    return {
      title: `${niche}s ${stateName} | ${siteName}`,
      description: `Find the best ${niche.toLowerCase()}s in ${stateName}. Discover top-rated ${niche.toLowerCase()}s, read reviews, and get contact information.`,
      keywords: `${niche.toLowerCase()}s, ${stateName}, local ${niche.toLowerCase()}s, ${niche.toLowerCase()} directory, ${stateName} ${niche.toLowerCase()}s`,
      openGraph: {
        title: `${niche}s ${stateName}`,
        description: `Find the best ${niche.toLowerCase()}s in ${stateName}`,
        url: `${siteConfig.siteUrl}/${slug}`,
        siteName: siteName,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${niche}s ${stateName}`,
        description: `Find the best ${niche.toLowerCase()}s in ${stateName}`,
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
  const siteName = settings.site_name || 'DirectoryHub'
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
      } catch (_apiError) {
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
  } catch (_error) {
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
    
    console.log('=== STATE PAGE ===')
    console.log('URL slug:', slug)
    console.log('Original state name:', parts.slice(nicheParts.length).join('-'))
    console.log('Cleaned state name:', stateName)
    console.log('Looking for cities in state:', stateName)
    
    // Fetch cities for this state
    let cities: Array<{id: string, name: string}> = []
    
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
      
      if (!citiesError && stateCities) {
        console.log('Raw state cities data:', stateCities)
        cities = stateCities.map(city => ({
          id: city.id,
          name: city.name
        }))
        console.log('Found cities in state:', cities.map(c => c.name))
        console.log('Cities count:', cities.length)
        
        // Note: Listings are not shown on state pages - only on individual city pages
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
              {niche}s {stateName}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Discover {cities.length} cities in {stateName}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{cities.length}</div>
                <div className="text-gray-600">Cities</div>
              </div>
            </div>
          </div>
        </section>


        {/* Cities Section */}
        {cities.length > 0 ? (
          <section className="py-16 bg-gray-50">
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
          <section className="py-16 bg-gray-50">
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