import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const stateId = searchParams.get('stateId')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const minRating = searchParams.get('minRating')
    const minReviews = searchParams.get('minReviews')
    const hasPhone = searchParams.get('hasPhone')
    const hasWebsite = searchParams.get('hasWebsite')
    const search = searchParams.get('search')

        let query = supabase
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

    // City filter
    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    // State filter (get all cities in state first)
    if (stateId && !cityId) {
      const { data: cities } = await supabase
        .from('cities')
        .select('id')
        .eq('state_id', stateId)
      
      if (cities && cities.length > 0) {
        query = query.in('city_id', cities.map(c => c.id))
      }
    }

    // Category filter
    if (category) {
      query = query.eq('category', category)
    }

    // Featured filter
    if (featured === 'true') {
      query = query.eq('featured', true).limit(3)
    }

    // Rating filter
    if (minRating) {
      const rating = parseFloat(minRating)
      if (!isNaN(rating)) {
        query = query.gte('review_rating', rating)
      }
    }

    // Review count filter
    if (minReviews) {
      const reviews = parseInt(minReviews)
      if (!isNaN(reviews)) {
        query = query.gte('number_of_reviews', reviews)
      }
    }

    // Phone availability filter
    if (hasPhone === 'true') {
      query = query.not('phone', 'is', null).neq('phone', '')
    }

    // Website availability filter
    if (hasWebsite === 'true') {
      query = query.not('website', 'is', null).neq('website', '')
    }

    // Search filter (searches in business name, category, and address)
    if (search) {
      query = query.or(`business.ilike.%${search}%,category.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Vary': 'Accept-Encoding'
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listings, isCSV } = body

    if (isCSV && listings) {
      // Handle CSV import
      const { data, error } = await supabase
        .from('listings')
        .insert(listings)
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

      if (error) throw error

      return NextResponse.json(data, { status: 201 })
    } else {
      // Handle single listing creation
      const { business, category, review_rating, number_of_reviews, address, website, phone, email, city_id } = body

      console.log('Creating single listing with data:', { business, category, city_id })

      if (!business || !category || !city_id) {
        console.log('Validation failed:', { business: !!business, category: !!category, city_id: !!city_id })
        return NextResponse.json(
          { error: 'Business name, category, and city ID are required' },
          { status: 400 }
        )
      }

      const insertData = {
        business,
        category,
        review_rating: review_rating || 0,
        number_of_reviews: number_of_reviews || 0,
        address: address || '',
        website: website || '',
        phone: phone || '',
        email: email || '',
        city_id,
        featured: false // Ensure featured is set to false by default
      }

      console.log('Inserting data:', insertData)

      const { data, error } = await supabase
        .from('listings')
        .insert([insertData])
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
        .single()

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('Successfully created listing:', data)
      return NextResponse.json(data, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating listings:', error)
    return NextResponse.json(
      { error: 'Failed to create listing(s)' },
      { status: 500 }
    )
  }
}

