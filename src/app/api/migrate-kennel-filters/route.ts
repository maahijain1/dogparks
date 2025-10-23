import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Starting kennel filters migration...')
    
    // Read the SQL migration file
    const sqlPath = path.join(process.cwd(), 'src/lib/add-kennel-filters.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    const results = []
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}`)
        console.log(`SQL: ${statement.substring(0, 100)}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error)
            results.push({ statement: i + 1, success: false, error: error.message })
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
            results.push({ statement: i + 1, success: true })
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err)
          results.push({ 
            statement: i + 1, 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          })
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length
    
    console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} errors`)
    
    return NextResponse.json({
      success: true,
      message: `Kennel filters migration completed: ${successCount} successful, ${errorCount} errors`,
      results: results,
      summary: {
        total: statements.length,
        successful: successCount,
        errors: errorCount
      }
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
