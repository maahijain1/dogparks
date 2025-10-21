import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function POST() {
  try {
    const results = []
    const errors = []

    // Step 1: Try to create article_templates table by attempting to insert a test record
    try {
      // First check if table exists by trying to select from it
      const { error: selectError } = await supabase
        .from('article_templates')
        .select('id')
        .limit(1)

      if (selectError && selectError.message.includes('relation "article_templates" does not exist')) {
        // Table doesn't exist, we need to create it manually
        // Since we can't run DDL from the API, we'll provide instructions
        results.push('⚠️ article_templates table does not exist')
        errors.push('MANUAL ACTION REQUIRED: Run this SQL in your Supabase SQL Editor:')
        errors.push('')
        errors.push('CREATE TABLE article_templates (')
        errors.push('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,')
        errors.push('  title VARCHAR(255) NOT NULL,')
        errors.push('  content TEXT NOT NULL,')
        errors.push('  slug VARCHAR(255) UNIQUE NOT NULL,')
        errors.push('  description TEXT,')
        errors.push('  is_active BOOLEAN DEFAULT true,')
        errors.push('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),')
        errors.push('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
        errors.push(');')
        errors.push('')
        errors.push('CREATE INDEX IF NOT EXISTS idx_article_templates_slug ON article_templates(slug);')
        errors.push('CREATE INDEX IF NOT EXISTS idx_article_templates_active ON article_templates(is_active);')
      } else {
        results.push('✓ article_templates table exists')
      }
    } catch (err) {
      errors.push(`Error checking article_templates: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Step 2: Check if articles table has city_id and template_id columns
    try {
      // Try to select city_id column
      const { error: cityIdError } = await supabase
        .from('articles')
        .select('city_id')
        .limit(1)

      if (cityIdError && cityIdError.message.includes('column "city_id" does not exist')) {
        results.push('⚠️ articles table missing city_id column')
        errors.push('MANUAL ACTION REQUIRED: Run this SQL in your Supabase SQL Editor:')
        errors.push('')
        errors.push('ALTER TABLE articles ADD COLUMN city_id UUID REFERENCES cities(id) ON DELETE SET NULL;')
        errors.push('ALTER TABLE articles ADD COLUMN template_id UUID REFERENCES article_templates(id) ON DELETE SET NULL;')
        errors.push('CREATE INDEX IF NOT EXISTS idx_articles_city_id ON articles(city_id);')
        errors.push('CREATE INDEX IF NOT EXISTS idx_articles_template_id ON articles(template_id);')
      } else {
        results.push('✓ articles table has city_id column')
      }
    } catch (err) {
      errors.push(`Error checking articles table: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Step 3: Test if we can create a template (if tables exist)
    try {
      const { error: testError } = await supabase
        .from('article_templates')
        .insert({
          title: 'Test Template',
          content: 'This is a test template',
          slug: `test-template-${Date.now()}`,
          description: 'Test template for database verification',
          is_active: true
        })
        .select()

      if (testError) {
        results.push(`⚠️ Cannot create templates: ${testError.message}`)
        errors.push(`Template creation failed: ${testError.message}`)
      } else {
        results.push('✓ Template creation works')
      }
    } catch (err) {
      results.push(`⚠️ Template creation test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Database setup requires manual SQL execution',
        details: errors,
        results,
        instructions: 'Copy the SQL commands from the details and run them in your Supabase SQL Editor'
      }, { status: 200 }) // Return 200 so it's not treated as an error
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema is properly configured!',
      results
    })

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database schema', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
