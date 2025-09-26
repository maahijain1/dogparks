import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 })
  }
  
  try {
    console.log('Debug: Looking for article with slug:', slug)
    console.log('Debug: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Debug: Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Test basic Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count')
      .limit(1)
    
    console.log('Debug: Supabase connection test:', { testData, testError })
    
    // Try to fetch the specific article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    
    console.log('Debug: Article query result:', { article, articleError })
    
    return NextResponse.json({
      slug,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      connectionTest: { testData, testError },
      article,
      articleError: articleError?.message || null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Debug: Unexpected error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error',
      slug,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
