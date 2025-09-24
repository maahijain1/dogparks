import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateId = searchParams.get('stateId')

    let query = supabase
      .from('cities')
      .select(`
        *,
        states (
          id,
          name
        )
      `)
      .order('name')

    if (stateId) {
      query = query.eq('state_id', stateId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, state_id } = await request.json()

    if (!name || !state_id) {
      return NextResponse.json(
        { error: 'City name and state ID are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cities')
      .insert([{ name, state_id }])
      .select(`
        *,
        states (
          id,
          name
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    )
  }
}

