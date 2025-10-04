import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, published, featured_image, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      count: articles?.length || 0,
      articles: articles || []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
