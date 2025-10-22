import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debugging article creation issues...')

    // Check if articles table exists and its structure
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(1)

    if (articlesError) {
      return NextResponse.json({
        success: false,
        error: 'Articles table error',
        details: articlesError.message,
        code: articlesError.code,
        hint: articlesError.hint
      })
    }

    // Check if city_id column exists
    let hasCityIdColumn = false
    let cityIdError = null
    try {
      const { error } = await supabase
        .from('articles')
        .select('city_id')
        .limit(1)
      
      hasCityIdColumn = !error || !error.message.includes('column "city_id" does not exist')
      cityIdError = error
    } catch (err) {
      hasCityIdColumn = false
      cityIdError = err
    }

    // Check if template_id column exists
    let hasTemplateIdColumn = false
    let templateIdError = null
    try {
      const { error } = await supabase
        .from('articles')
        .select('template_id')
        .limit(1)
      
      hasTemplateIdColumn = !error || !error.message.includes('column "template_id" does not exist')
      templateIdError = error
    } catch (err) {
      hasTemplateIdColumn = false
      templateIdError = err
    }

    // Check if article_templates table exists
    const { data: templates, error: templatesError } = await supabase
      .from('article_templates')
      .select('*')
      .limit(1)

    // Test a simple insert to see what happens
    let insertTest = null
    try {
      const testData = {
        title: 'Test Article',
        content: 'Test content',
        slug: `test-article-${Date.now()}`,
        featured_image: null,
        published: false
      }

      const { data, error } = await supabase
        .from('articles')
        .insert([testData])
        .select()
        .single()

      if (error) {
        insertTest = {
          success: false,
          error: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      } else {
        insertTest = {
          success: true,
          data: data
        }
        
        // Clean up test article
        await supabase
          .from('articles')
          .delete()
          .eq('id', data.id)
      }
    } catch (err) {
      insertTest = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      articlesTable: {
        exists: true,
        sampleData: articles?.[0] || null
      },
      columns: {
        city_id: {
          exists: hasCityIdColumn,
          error: cityIdError instanceof Error ? cityIdError.message : null
        },
        template_id: {
          exists: hasTemplateIdColumn,
          error: templateIdError instanceof Error ? templateIdError.message : null
        }
      },
      articleTemplatesTable: {
        exists: !templatesError,
        error: templatesError?.message || null,
        sampleData: templates?.[0] || null
      },
      insertTest,
      recommendations: [
        !hasCityIdColumn && 'Add city_id column to articles table',
        !hasTemplateIdColumn && 'Add template_id column to articles table',
        templatesError && 'Create article_templates table',
        insertTest && !insertTest.success && 'Fix article insertion issues'
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('❌ Error debugging article creation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to debug article creation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
