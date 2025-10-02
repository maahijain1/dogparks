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
  } catch (error) {
    console.error('Error updating state:', error)
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
    console.log('=== DELETE STATE API ===')
    console.log('Attempting to delete state with ID:', id)

    // First check if state exists
    const { data: existingState, error: checkError } = await supabase
      .from('states')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError) {
      console.error('Error checking state existence:', checkError)
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'State not found' },
          { status: 404 }
        )
      }
      throw checkError
    }

    console.log('State found:', existingState)

    // Delete the state
    const { error } = await supabase
      .from('states')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting state:', error)
      throw error
    }

    console.log('State deleted successfully:', id)

    return NextResponse.json(
      { message: 'State deleted successfully', deletedId: id },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    )
  } catch (error) {
    console.error('DELETE state error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
