import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🗑️ Starting deletion of about-* articles...')

    // Find all articles that start with "about-"
    const { data: aboutArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug, title')
      .like('slug', 'about-%')

    if (fetchError) {
      console.error('❌ Error fetching about articles:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch about articles', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!aboutArticles || aboutArticles.length === 0) {
      console.log('✅ No about-* articles found to delete')
      return NextResponse.json({ 
        success: true, 
        deleted: 0, 
        message: 'No about-* articles found to delete' 
      })
    }

    console.log(`📊 Found ${aboutArticles.length} about-* articles to delete:`)
    aboutArticles.forEach(article => {
      console.log(`  - ${article.slug} (${article.title})`)
    })

    // Delete all about-* articles
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .like('slug', 'about-%')

    if (deleteError) {
      console.error('❌ Error deleting about articles:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete about articles', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully deleted ${aboutArticles.length} about-* articles`)

    return NextResponse.json({
      success: true,
      deleted: aboutArticles.length,
      articles: aboutArticles.map(a => ({ slug: a.slug, title: a.title })),
      message: `Successfully deleted ${aboutArticles.length} about-* articles`
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
