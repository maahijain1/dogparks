import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name, state_id } = await request.json()
    const { id } = await params

    if (!name || !state_id) {
      return NextResponse.json(
        { error: 'City name and state ID are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cities')
      .update({ name, state_id })
      .eq('id', id)
      .select(`
        *,
        states (
          id,
          name
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update city' },
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
      .from('cities')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'City deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    )
  }
}
