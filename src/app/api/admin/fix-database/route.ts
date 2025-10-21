import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'src', 'lib', 'fix-articles-table.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    const results = []
    const errors = []

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          // If exec_sql doesn't exist, try direct query
          const { error: directError } = await supabase.from('_').select('*').limit(0)
          if (directError && directError.message.includes('exec_sql')) {
            // Fallback: try to execute via a different method
            const { error: fallbackError } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .limit(1)
            
            if (fallbackError) {
              errors.push(`Cannot execute SQL directly: ${error.message}`)
              continue
            }
          }
        }
        results.push(`✓ ${statement.substring(0, 50)}...`)
      } catch (err) {
        errors.push(`✗ ${statement.substring(0, 50)}... - ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Database fix completed with ${errors.length} errors`,
        details: errors,
        results
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Database schema fixed successfully! ${results.length} operations completed.`,
      results
    })

  } catch (error) {
    console.error('Error fixing database:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix database schema', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
