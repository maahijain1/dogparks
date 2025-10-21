import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'src/lib/create-templates-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    const results = []
    const errors = []
    
    // Execute each SQL statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        })
        
        if (error) {
          errors.push(`Error executing statement: ${error.message}`)
        } else {
          results.push(`Successfully executed: ${statement.substring(0, 50)}...`)
        }
      } catch (error) {
        errors.push(`Error executing statement: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Migration completed with some errors',
        details: `Errors: ${errors.join('\n')}\n\nResults: ${results.join('\n')}`
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      details: `Executed ${statements.length} SQL statements successfully.\n\nResults: ${results.join('\n')}`
    })
    
  } catch (error) {
    console.error('Error running migration:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to run migration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
