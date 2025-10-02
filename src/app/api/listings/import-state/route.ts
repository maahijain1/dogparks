import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

interface ListingData {
  business: string
  category: string
  review_rating: number
  number_of_reviews: number
  address: string
  website: string
  phone: string
  email: string
  featured: boolean
  extractedCity: string
  originalRow: number
}

// City name variations and corrections
const CITY_CORRECTIONS: { [key: string]: string } = {
  // Common abbreviations and variations
  'st': 'saint',
  'st.': 'saint',
  'mt': 'mount',
  'mt.': 'mount',
  'ft': 'fort',
  'ft.': 'fort',
  'n': 'north',
  'n.': 'north',
  's': 'south',
  's.': 'south',
  'e': 'east',
  'e.': 'east',
  'w': 'west',
  'w.': 'west',
}

// Extract city from address
function extractCityFromAddress(address: string): string | null {
  if (!address || typeof address !== 'string') return null
  
  // Common address patterns:
  // "123 Main St, Birmingham, AL 35203"
  // "456 Oak Ave, Mobile, Alabama"
  // "789 Pine Rd, Huntsville AL"
  
  const addressParts = address.split(',').map(part => part.trim())
  
  // If we have comma-separated parts, the city is usually the second-to-last part
  if (addressParts.length >= 2) {
    let cityPart = addressParts[addressParts.length - 2]
    
    // Remove state abbreviations if they're in the same part
    cityPart = cityPart.replace(/\b(AL|Alabama|AK|Alaska|AZ|Arizona|AR|Arkansas|CA|California|CO|Colorado|CT|Connecticut|DE|Delaware|FL|Florida|GA|Georgia|HI|Hawaii|ID|Idaho|IL|Illinois|IN|Indiana|IA|Iowa|KS|Kansas|KY|Kentucky|LA|Louisiana|ME|Maine|MD|Maryland|MA|Massachusetts|MI|Michigan|MN|Minnesota|MS|Mississippi|MO|Missouri|MT|Montana|NE|Nebraska|NV|Nevada|NH|New Hampshire|NJ|New Jersey|NM|New Mexico|NY|New York|NC|North Carolina|ND|North Dakota|OH|Ohio|OK|Oklahoma|OR|Oregon|PA|Pennsylvania|RI|Rhode Island|SC|South Carolina|SD|South Dakota|TN|Tennessee|TX|Texas|UT|Utah|VT|Vermont|VA|Virginia|WA|Washington|WV|West Virginia|WI|Wisconsin|WY|Wyoming)\b/gi, '').trim()
    
    // Remove ZIP codes (5 digits or ZIP+4)
    cityPart = cityPart.replace(/\b\d{5}(-\d{4})?\b/g, '').trim()
    
    if (cityPart && cityPart.length > 1) {
      return normalizeCityName(cityPart)
    }
  }
  
  return null
}

// Normalize city name
function normalizeCityName(cityName: string): string {
  if (!cityName) return ''
  
  let normalized = cityName.toLowerCase().trim()
  
  // Apply corrections
  const words = normalized.split(/\s+/)
  const correctedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '')
    return CITY_CORRECTIONS[cleanWord] || word
  })
  
  normalized = correctedWords.join(' ')
  
  // Capitalize each word
  return normalized.replace(/\b\w/g, l => l.toUpperCase())
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const stateId = formData.get('stateId') as string
    const autoCreateCities = formData.get('autoCreateCities') === 'true'

    if (!file || !stateId) {
      return NextResponse.json(
        { error: 'CSV file and state selection are required' },
        { status: 400 }
      )
    }

    // Verify state exists
    const { data: stateData, error: stateError } = await supabase
      .from('states')
      .select('id, name')
      .eq('id', stateId)
      .single()

    if (stateError || !stateData) {
      return NextResponse.json(
        { error: 'Selected state not found' },
        { status: 404 }
      )
    }

    // Parse CSV with the same header mapping as individual city import
    const csvText = await file.text()
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Map CSV headers to our database fields (EXACT SAME as individual city import)
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

    const rows = parseResult.data as Record<string, unknown>[]
    console.log(`Processing ${rows.length} rows from CSV for state: ${stateData.name}`)

    // Get existing cities for this state
    const { data: existingCities } = await supabase
      .from('cities')
      .select('id, name')
      .eq('state_id', stateId)

    const cityMap = new Map<string, string>() // normalized name -> city_id
    existingCities?.forEach(city => {
      const normalizedName = normalizeCityName(city.name)
      cityMap.set(normalizedName, city.id)
    })

    const stats = {
      processed: 0,
      imported: 0,
      citiesCreated: 0,
      citiesMatched: 0,
      skipped: 0,
      errors: [] as string[]
    }

    const newCities = new Set<string>() // Track cities we need to create
    const listingsToImport: ListingData[] = []

    // First pass: analyze all rows and collect city information
    for (const [index, row] of rows.entries()) {
      stats.processed++

      try {
        // Extract basic listing data using mapped field names
        const typedRow = row as Record<string, string>
        const business = typedRow.business || ''
        const address = typedRow.address || ''
        
        if (!business.trim()) {
          stats.skipped++
          stats.errors.push(`Row ${index + 1}: Missing business name`)
          continue
        }

        if (!address.trim()) {
          stats.skipped++
          stats.errors.push(`Row ${index + 1}: Missing address for ${business}`)
          continue
        }

        // Extract city from address
        const extractedCity = extractCityFromAddress(address)
        if (!extractedCity) {
          stats.skipped++
          stats.errors.push(`Row ${index + 1}: Could not extract city from address: ${address}`)
          continue
        }

        const normalizedCityName = normalizeCityName(extractedCity)
        
        // Check if city exists or needs to be created
        if (cityMap.has(normalizedCityName)) {
          stats.citiesMatched++
        } else if (autoCreateCities) {
          newCities.add(normalizedCityName)
        } else {
          stats.skipped++
          stats.errors.push(`Row ${index + 1}: City "${extractedCity}" not found and auto-creation disabled`)
          continue
        }

        // Prepare listing data using mapped field names (EXACT SAME as individual city import)
        const listingData = {
          business: business.trim(),
          category: typedRow.category || 'Business',
          review_rating: parseFloat(typedRow.review_rating) || 0,
          number_of_reviews: parseInt(typedRow.number_of_reviews) || 0,
          address: address.trim(),
          website: typedRow.website || '',
          phone: typedRow.phone || '',
          email: typedRow.email || '',
          featured: typedRow.featured === 'true' || typedRow.featured === '1' || typedRow.featured === 'yes' || false,
          extractedCity: normalizedCityName,
          originalRow: index + 1
        }

        listingsToImport.push(listingData)

      } catch (error) {
        stats.errors.push(`Row ${index + 1}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`)
        continue
      }
    }

    // Second pass: Create missing cities if auto-creation is enabled
    if (autoCreateCities && newCities.size > 0) {
      console.log(`Creating ${newCities.size} new cities:`, Array.from(newCities))
      
      const citiesToCreate = Array.from(newCities).map(cityName => ({
        name: cityName,
        state_id: stateId
      }))

      const { data: createdCities, error: createError } = await supabase
        .from('cities')
        .insert(citiesToCreate)
        .select('id, name')

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create cities', details: createError.message },
          { status: 500 }
        )
      }

      // Update city map with newly created cities
      createdCities?.forEach(city => {
        const normalizedName = normalizeCityName(city.name)
        cityMap.set(normalizedName, city.id)
      })

      stats.citiesCreated = createdCities?.length || 0
      console.log(`Successfully created ${stats.citiesCreated} cities`)
    }

    // Third pass: Import listings with correct city_ids and apply same filtering as individual city import
    const allValidListings = []
    for (const listing of listingsToImport) {
      const cityId = cityMap.get(listing.extractedCity)
      if (cityId) {
        allValidListings.push({
          business: listing.business,
          category: listing.category,
          review_rating: listing.review_rating,
          number_of_reviews: listing.number_of_reviews,
          address: listing.address,
          website: listing.website,
          phone: listing.phone,
          email: listing.email,
          featured: listing.featured,
          city_id: cityId
        })
      } else {
        stats.skipped++
        stats.errors.push(`Row ${listing.originalRow}: City "${listing.extractedCity}" still not found after processing`)
      }
    }

    // Filter out listings that don't have either phone or website (SAME AS individual city import)
    const validListings = allValidListings.filter((listing) => {
      const hasPhone = listing.phone && listing.phone.trim() !== ''
      const hasWebsite = listing.website && listing.website.trim() !== ''
      return hasPhone || hasWebsite
    })

    const filteredCount = allValidListings.length - validListings.length
    if (filteredCount > 0) {
      console.log(`Filtered out ${filteredCount} listings without phone/website`)
    }

    // Import all valid listings
    if (validListings.length > 0) {
      console.log(`Importing ${validListings.length} listings...`)
      
      const { data: importedListings, error: importError } = await supabase
        .from('listings')
        .insert(validListings)
        .select('id')

      if (importError) {
        return NextResponse.json(
          { error: 'Failed to import listings', details: importError.message },
          { status: 500 }
        )
      }

      stats.imported = importedListings?.length || 0
    }

    console.log('Import completed with stats:', stats)

    return NextResponse.json({
      message: 'State import completed successfully',
      stats: {
        ...stats,
        state: stateData.name,
        totalCities: cityMap.size,
        filtered: filteredCount
      }
    }, { status: 200 })

  } catch (error) {
    console.error('State import error:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
