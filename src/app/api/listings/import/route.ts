import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const cityId = formData.get('cityId') as string

    if (!file || !cityId) {
      return NextResponse.json(
        { error: 'File and city ID are required' },
        { status: 400 }
      )
    }

    const text = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Map CSV headers to our database fields
        const headerMap: { [key: string]: string } = {
          'Business': 'business',
          'Category': 'category',
          'Review Ra': 'review_rating',
          'Number o': 'number_of_reviews',
          'Address': 'address',
          'Website': 'website',
          'Phone': 'phone',
          'Email': 'email',
          'Featured': 'featured'
        }
        return headerMap[header] || header.toLowerCase().replace(/\s+/g, '_')
      }
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      )
    }

    // Transform data for database insertion and filter out listings without contact info
    const allListings = parseResult.data.map((row: unknown) => {
      const typedRow = row as Record<string, string>
      return {
        business: typedRow.business || '',
        category: typedRow.category || '',
        review_rating: parseFloat(typedRow.review_rating) || 0,
        number_of_reviews: parseInt(typedRow.number_of_reviews) || 0,
        address: typedRow.address || '',
        website: typedRow.website || '',
        phone: typedRow.phone || '',
        email: typedRow.email || '',
        city_id: cityId,
        featured: typedRow.featured === 'true' || typedRow.featured === '1' || typedRow.featured === 'yes' || false
      }
    })

    // Filter out listings that don't have either phone or website
    const listings = allListings.filter((listing: { phone: string; website: string }) => {
      const hasPhone = listing.phone && listing.phone.trim() !== ''
      const hasWebsite = listing.website && listing.website.trim() !== ''
      return hasPhone || hasWebsite
    })

    const filteredCount = allListings.length - listings.length

    // Insert listings into database
    const { data, error } = await supabase
      .from('listings')
      .insert(listings)
      .select(`
        *,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        )
      `)

    if (error) throw error

    return NextResponse.json({
      message: `Successfully imported ${listings.length} listings${filteredCount > 0 ? ` (${filteredCount} listings without phone/website were filtered out)` : ''}`,
      data,
      stats: {
        imported: listings.length,
        filtered: filteredCount,
        total: allListings.length
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import listings' },
      { status: 500 }
    )
  }
}

