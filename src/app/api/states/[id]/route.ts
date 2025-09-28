import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json()
    const { id } = await params

    if (!name) {
      return NextResponse.json(
        { error: 'State name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('states')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update state' },
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
      .from('states')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'State deleted successfully' })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete state' },
      { status: 500 }
    )
  }
}
