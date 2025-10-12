import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== DEBUG ARTICLES API ===')
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('Database connection error:', testError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 })
    }
    
    console.log('Database connection: OK')
    
    // Test table structure
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(5)
    
    if (articlesError) {
      console.error('Articles query error:', articlesError)
      return NextResponse.json({
        success: false,
        error: 'Articles query failed',
        details: articlesError.message,
        code: articlesError.code,
        hint: articlesError.hint
      }, { status: 500 })
    }
    
    console.log('Articles query: OK')
    console.log('Found articles:', articles?.length || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and queries working',
      articlesCount: articles?.length || 0,
      sampleArticle: articles?.[0] || null
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG POST ARTICLES API ===')
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    const { title, content, slug, featured_image, published } = body
    
    if (!title || !content || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missing: {
          title: !title,
          content: !content,
          slug: !slug
        }
      }, { status: 400 })
    }
    
    console.log('Validation passed')
    
    // Test the insert operation
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
      console.error('Insert error:', error)
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: error.message,
        code: error.code,
        hint: error.hint,
        details_full: error
      }, { status: 500 })
    }
    
    console.log('Insert successful:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      article: data
    }, { status: 201 })
    
  } catch (error) {
    console.error('Debug POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}