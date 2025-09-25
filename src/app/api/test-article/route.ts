import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'our-favorite-management-tips-on-motivating-your-team'
  
  try {
    // Test the exact query used in the slug page
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()
    
    console.log('Article query result:', { data, error, slug })
    
    return NextResponse.json({
      slug,
      article: data,
      error: error?.message,
      found: !!data
    })
  } catch (err) {
    console.error('Article test error:', err)
    return NextResponse.json({
      slug,
      error: err instanceof Error ? err.message : 'Unknown error',
      found: false
    })
  }
}
