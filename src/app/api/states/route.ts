import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('states')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching states:', error)
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'State name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('states')
      .insert([{ name }])
      .select()
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
    console.error('Error creating state:', error)
    return NextResponse.json(
      { error: 'Failed to create state' },
      { status: 500 }
    )
  }
}

