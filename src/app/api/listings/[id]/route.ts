import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { business, category, review_rating, number_of_reviews, address, website, phone, email, city_id, featured } = body

    // If this is a featured toggle (only featured field is being updated)
    if (featured !== undefined && Object.keys(body).length === 2 && body.id) {
      console.log('Updating featured status for listing:', id, 'to:', featured)
      
      const { data, error } = await supabase
        .from('listings')
        .update({ featured })
        .eq('id', id)
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
      
      console.log('Successfully updated featured status:', data)
      return NextResponse.json(data)
    }

    // Full update validation
    if (!business || !category || !city_id) {
      return NextResponse.json(
        { error: 'Business name, category, and city ID are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('listings')
      .update({
        business,
        category,
        review_rating: review_rating || 0,
        number_of_reviews: number_of_reviews || 0,
        address: address || '',
        website: website || '',
        phone: phone || '',
        email: email || '',
        city_id,
        featured: featured || false
      })
      .eq('id', id)
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

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: `Failed to update listing: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
