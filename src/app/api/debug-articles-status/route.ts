import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Checking articles status...')

    // Check if articles table exists and has data
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(5)

    if (articlesError) {
      return NextResponse.json({
        success: false,
        error: 'Articles table error',
        details: articlesError.message,
        hasArticlesTable: false
      })
    }

    // Check if city_id column exists
    let hasCityIdColumn = false
    try {
      const { error: cityIdError } = await supabase
        .from('articles')
        .select('city_id')
        .limit(1)
      
      hasCityIdColumn = !cityIdError || !cityIdError.message.includes('column "city_id" does not exist')
    } catch {
      hasCityIdColumn = false
    }

    // Check cities count
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name')
      .limit(10)

    // Check if any articles have city_id
    const articlesWithCityId = articles?.filter(article => article.city_id) || []

    return NextResponse.json({
      success: true,
      hasArticlesTable: true,
      hasCityIdColumn,
      totalArticles: articles?.length || 0,
      articlesWithCityId: articlesWithCityId.length,
      totalCities: cities?.length || 0,
      sampleArticles: articles?.slice(0, 3) || [],
      sampleCities: cities?.slice(0, 3) || [],
      message: hasCityIdColumn 
        ? 'Articles table exists with city_id column' 
        : 'Articles table exists but missing city_id column'
    })

  } catch (error) {
    console.error('❌ Error checking articles status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check articles status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
