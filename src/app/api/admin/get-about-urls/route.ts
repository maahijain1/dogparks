import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Finding all about-* URLs...')

    // Get all articles that start with "about-"
    const { data: aboutArticles, error } = await supabase
      .from('articles')
      .select('slug, title, created_at')
      .like('slug', 'about-%')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching about articles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch about articles', details: error.message },
        { status: 500 }
      )
    }

    if (!aboutArticles || aboutArticles.length === 0) {
      console.log('✅ No about-* articles found')
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        urls: [],
        message: 'No about-* articles found' 
      })
    }

    // Generate full URLs
    const urls = aboutArticles.map(article => ({
      url: `https://www.dogboardingkennels.us/${article.slug}`,
      slug: article.slug,
      title: article.title,
      created_at: article.created_at
    }))

    console.log(`📊 Found ${urls.length} about-* URLs`)

    return NextResponse.json({
      success: true,
      count: urls.length,
      urls: urls,
      message: `Found ${urls.length} about-* URLs to remove from Google index`
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
