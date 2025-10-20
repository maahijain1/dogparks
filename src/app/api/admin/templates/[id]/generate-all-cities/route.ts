import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getTemplateVariables, replaceTemplateVariables } from '@/lib/template-variables'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('article_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found or inactive' },
        { status: 404 }
      )
    }

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        states (
          id,
          name
        )
      `)

    if (citiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch cities' },
        { status: 500 }
      )
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json(
        { error: 'No cities found' },
        { status: 404 }
      )
    }

    const generatedArticles = []
    const errors = []

    // Process each city
    for (const city of cities) {
      try {
        // Get template variables for this city
        const variables = await getTemplateVariables(city.id)
        
        // Replace variables in template content
        const processedContent = replaceTemplateVariables(template.content, {
          ...variables,
          cityName: city.name,
          stateName: city.states?.name || 'Unknown State',
          cityId: city.id,
          stateId: city.states?.id || ''
        })

        // Replace variables in title
        const processedTitle = replaceTemplateVariables(template.title, {
          ...variables,
          cityName: city.name,
          stateName: city.states?.name || 'Unknown State',
          cityId: city.id,
          stateId: city.states?.id || ''
        })

        // Replace variables in slug
        const processedSlug = replaceTemplateVariables(template.slug, {
          ...variables,
          cityName: city.name.toLowerCase().replace(/\s+/g, '-'),
          stateName: city.states?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-state',
          cityId: city.id,
          stateId: city.states?.id || ''
        })

        // Check if article already exists for this city and template
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', processedSlug)
          .eq('city_id', city.id)
          .single()

        if (existingArticle) {
          // Update existing article
          const { data: updatedArticle, error: updateError } = await supabase
            .from('articles')
            .update({
              title: processedTitle,
              content: processedContent,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingArticle.id)
            .select()
            .single()

          if (updateError) {
            errors.push(`Failed to update article for ${city.name}: ${updateError.message}`)
          } else {
            generatedArticles.push({
              city: city.name,
              action: 'updated',
              article: updatedArticle
            })
          }
        } else {
          // Create new article
          const { data: newArticle, error: createError } = await supabase
            .from('articles')
            .insert({
              title: processedTitle,
              content: processedContent,
              slug: processedSlug,
              featured_image: '',
              published: true,
              template_id: id,
              city_id: city.id
            })
            .select()
            .single()

          if (createError) {
            errors.push(`Failed to create article for ${city.name}: ${createError.message}`)
          } else {
            generatedArticles.push({
              city: city.name,
              action: 'created',
              article: newArticle
            })
          }
        }
      } catch (error) {
        errors.push(`Error processing ${city.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: generatedArticles.length,
      generated: generatedArticles,
      errors: errors
    })

  } catch (error) {
    console.error('Error generating articles:', error)
    return NextResponse.json(
      { error: 'Failed to generate articles' },
      { status: 500 }
    )
  }
}
