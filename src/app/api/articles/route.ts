import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

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

    // Add cache-busting headers
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/articles ===')
    
    const body = await request.json()
    console.log('Request body received:', {
      title: body.title?.substring(0, 50) + '...',
      content: body.content?.substring(0, 100) + '...',
      slug: body.slug,
      featured_image: body.featured_image,
      published: body.published
    })

    const { title, content, slug, featured_image, published } = body

    if (!title || !content || !slug) {
      console.error('Validation failed:', { title: !!title, content: !!content, slug: !!slug })
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    console.log('Validation passed, attempting database insert...')

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

    if (error) {
      console.error('Database error:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
      return NextResponse.json(
        { 
          error: 'Database error',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('Article created successfully:', data.id)
    console.log('Returning data:', data)
    
    const response = NextResponse.json(data, { status: 201 })
    console.log('Response created:', response.status)
    return response
  } catch (error) {
    console.error('POST /api/articles error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

