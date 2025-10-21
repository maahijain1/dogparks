import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // First check if the article_templates table exists
    const { data, error } = await supabase
      .from('article_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of error
      if (error.message.includes('relation "article_templates" does not exist') || 
          error.message.includes('table "article_templates" does not exist')) {
        console.log('article_templates table does not exist yet, returning empty array')
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, slug, description, is_active } = body

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existingTemplate } = await supabase
      .from('article_templates')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'A template with this slug already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('article_templates')
      .insert({
        title,
        content,
        slug,
        description: description || '',
        is_active: is_active !== false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
