import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🗑️ Starting bulk removal of about-* articles...')

    // Get count first
    const { count: totalCount, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .like('slug', 'about-%')

    if (countError) {
      console.error('❌ Error counting articles:', countError)
      return NextResponse.json(
        { error: 'Failed to count articles', details: countError.message },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${totalCount} about-* articles to delete`)

    // Delete all about-* articles in one query
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .like('slug', 'about-%')

    if (deleteError) {
      console.error('❌ Error deleting articles:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete articles', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully deleted ${totalCount} about-* articles`)

    return NextResponse.json({
      success: true,
      deleted: totalCount,
      message: `Successfully deleted ${totalCount} about-* articles in bulk`
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
