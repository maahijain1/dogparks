import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

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

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    if (category) {
      query = query.eq('category', category)
    }

          if (featured === 'true') {
            query = query.eq('featured', true).limit(3)
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

