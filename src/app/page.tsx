import HomeClient from '@/components/home/HomeClient'
import { supabaseAdmin } from '@/lib/supabase'
import { getSiteSettings } from '@/lib/dynamic-config'
import { State, City, Listing, Article } from '@/types/database'

type CityWithState = City & { states?: State }
type ListingWithRelations = Listing & { cities?: CityWithState }

export const dynamic = 'force-dynamic'

async function fetchStates(): Promise<State[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('states')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching states:', error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error('Unexpected error fetching states:', error)
    return []
  }
}

async function fetchCities(): Promise<CityWithState[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select(`*,
        states (
          id,
          name
        )`)
      .order('name')

    if (error) {
      console.error('Error fetching cities:', error)
      return []
    }

    return (data ?? []) as CityWithState[]
  } catch (error) {
    console.error('Unexpected error fetching cities:', error)
    return []
  }
}

async function fetchListings(limit = 120): Promise<ListingWithRelations[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select(`*,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )`)
      .order('featured', { ascending: false })
      .order('business')
      .limit(limit)

    if (error) {
      console.error('Error fetching listings:', error)
      return []
    }

    return (data ?? []) as ListingWithRelations[]
  } catch (error) {
    console.error('Unexpected error fetching listings:', error)
    return []
  }
}

async function fetchFeaturedListings(): Promise<ListingWithRelations[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select(`*,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )`)
      .eq('featured', true)
      .order('updated_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('Error fetching featured listings:', error)
      return []
    }

    return (data ?? []) as ListingWithRelations[]
  } catch (error) {
    console.error('Unexpected error fetching featured listings:', error)
    return []
  }
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(24)

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error('Unexpected error fetching articles:', error)
    return []
  }
}

export default async function HomePage() {
  const [settings, states, cities, listings, featuredListings, articles] = await Promise.all([
    getSiteSettings().catch(() => ({
      site_name: 'DirectoryHub',
      niche: 'Dog Park',
      country: 'USA',
    })),
    fetchStates(),
    fetchCities(),
    fetchListings(),
    fetchFeaturedListings(),
    fetchArticles(),
  ])

  const siteSettings = {
    siteName: settings.site_name || 'DirectoryHub',
    niche: settings.niche || 'Dog Park',
    country: settings.country || 'USA',
  }

  const fallbackFeatured =
    featuredListings.length > 0
      ? featuredListings
      : listings.filter((listing) => listing.featured).slice(0, 3)

  return (
    <HomeClient
      initialStates={states}
      initialCities={cities}
      initialListings={listings}
      initialFeaturedListings={fallbackFeatured}
      initialArticles={articles}
      initialSettings={siteSettings}
    />
  )
}


