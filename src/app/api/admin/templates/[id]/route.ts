import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, slug, description, is_active } = body

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists (excluding current template)
    const { data: existingTemplate } = await supabase
      .from('article_templates')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'A template with this slug already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('article_templates')
      .update({
        title,
        content,
        slug,
        description: description || '',
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('article_templates')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
