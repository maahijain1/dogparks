import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')

    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (published !== null) {
      query = query.eq('published', published === 'true')
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('API: Fetched articles count:', data?.length || 0)
    console.log('API: Articles:', data?.map(a => a.title) || [])

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, slug, featured_image, published } = await request.json()

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('articles')
      .insert([{
        title,
        content,
        slug,
        featured_image: featured_image || null,
        published: published || false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

