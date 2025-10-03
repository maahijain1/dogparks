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
  
  console.log(`Extracting city from address: "${address}"`)
  
  // Common address patterns:
  // "123 Main St, Birmingham, AL 35203"
  // "456 Oak Ave, Mobile, Alabama"
  // "789 Pine Rd, Huntsville AL"
  // "1633 Co Rd 337, Section, AL 35771, United States" (your format)
  
  const addressParts = address.split(',').map(part => part.trim())
  console.log(`Address parts:`, addressParts)
  
  // For your format: "1633 Co Rd 337, Section, AL 35771, United States"
  // The city is the second part (index 1)
  if (addressParts.length >= 3) {
    let cityPart = addressParts[1] // Second part should be the city
    
    console.log(`Initial city part: "${cityPart}"`)
    
    // Remove state abbreviations if they're in the same part
    cityPart = cityPart.replace(/\b(AL|Alabama|AK|Alaska|AZ|Arizona|AR|Arkansas|CA|California|CO|Colorado|CT|Connecticut|DE|Delaware|FL|Florida|GA|Georgia|HI|Hawaii|ID|Idaho|IL|Illinois|IN|Indiana|IA|Iowa|KS|Kansas|KY|Kentucky|LA|Louisiana|ME|Maine|MD|Maryland|MA|Massachusetts|MI|Michigan|MN|Minnesota|MS|Mississippi|MO|Missouri|MT|Montana|NE|Nebraska|NV|Nevada|NH|New Hampshire|NJ|New Jersey|NM|New Mexico|NY|New York|NC|North Carolina|ND|North Dakota|OH|Ohio|OK|Oklahoma|OR|Oregon|PA|Pennsylvania|RI|Rhode Island|SC|South Carolina|SD|South Dakota|TN|Tennessee|TX|Texas|UT|Utah|VT|Vermont|VA|Virginia|WA|Washington|WV|West Virginia|WI|Wisconsin|WY|Wyoming)\b/gi, '').trim()
    
    // Remove ZIP codes (5 digits or ZIP+4)
    cityPart = cityPart.replace(/\b\d{5}(-\d{4})?\b/g, '').trim()
    
    console.log(`Cleaned city part: "${cityPart}"`)
    
    // Validate city name - reject if it looks like an address or number
    if (cityPart && cityPart.length > 1 && isValidCityName(cityPart)) {
      const normalized = normalizeCityName(cityPart)
      console.log(`Normalized city: "${normalized}"`)
      return normalized
    }
  }
  
  // Fallback: try the old logic for other formats
  if (addressParts.length >= 2) {
    let cityPart = addressParts[addressParts.length - 2]
    
    // Remove state abbreviations if they're in the same part
    cityPart = cityPart.replace(/\b(AL|Alabama|AK|Alaska|AZ|Arizona|AR|Arkansas|CA|California|CO|Colorado|CT|Connecticut|DE|Delaware|FL|Florida|GA|Georgia|HI|Hawaii|ID|Idaho|IL|Illinois|IN|Indiana|IA|Iowa|KS|Kansas|KY|Kentucky|LA|Louisiana|ME|Maine|MD|Maryland|MA|Massachusetts|MI|Michigan|MN|Minnesota|MS|Mississippi|MO|Missouri|MT|Montana|NE|Nebraska|NV|Nevada|NH|New Hampshire|NJ|New Jersey|NM|New Mexico|NY|New York|NC|North Carolina|ND|North Dakota|OH|Ohio|OK|Oklahoma|OR|Oregon|PA|Pennsylvania|RI|Rhode Island|SC|South Carolina|SD|South Dakota|TN|Tennessee|TX|Texas|UT|Utah|VT|Vermont|VA|Virginia|WA|Washington|WV|West Virginia|WI|Wisconsin|WY|Wyoming)\b/gi, '').trim()
    
    // Remove ZIP codes (5 digits or ZIP+4)
    cityPart = cityPart.replace(/\b\d{5}(-\d{4})?\b/g, '').trim()
    
    if (cityPart && cityPart.length > 1 && isValidCityName(cityPart)) {
      return normalizeCityName(cityPart)
    }
  }
  
  console.log(`Could not extract city from: "${address}"`)
  return null
}

// Validate city name to prevent address-like names
function isValidCityName(cityName: string): boolean {
  if (!cityName || cityName.length < 2) return false
  
  // Reject if it's mostly numbers or contains common address patterns
  const cleanName = cityName.trim()
  
  // Reject if it's just numbers (like "190 39")
  if (/^\d+(\s+\d+)*$/.test(cleanName)) {
    console.log(`Rejected city name "${cleanName}" - contains only numbers`)
    return false
  }
  
  // Reject if it contains common address abbreviations
  const addressPatterns = [
    /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|pkwy|parkway)\b/i,
    /\b(north|south|east|west|n|s|e|w)\s+\d+/i,
    /\b\d+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|pkwy|parkway)\b/i
  ]
  
  for (const pattern of addressPatterns) {
    if (pattern.test(cleanName)) {
      console.log(`Rejected city name "${cleanName}" - contains address pattern`)
      return false
    }
  }
  
  // Reject if it's too short or contains only special characters
  if (cleanName.length < 2 || /^[^a-zA-Z]+$/.test(cleanName)) {
    console.log(`Rejected city name "${cleanName}" - too short or no letters`)
    return false
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(cleanName)) {
    console.log(`Rejected city name "${cleanName}" - no letters found`)
    return false
  }
  
  return true
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
    console.log('CSV Text preview:', csvText.substring(0, 500))
    
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Clean header and map to our database fields
        const cleanHeader = header.trim()
        console.log('Processing header:', `"${cleanHeader}"`)
        
        const headerMap: { [key: string]: string } = {
          'Business': 'business',
          'business': 'business',
          'BUSINESS': 'business',
          'Category': 'category',
          'category': 'category',
          'CATEGORY': 'category',
          'Review Ra': 'review_rating',
          'review_rating': 'review_rating',
          'Review Rating': 'review_rating',
          'Number o': 'number_of_reviews',
          'number_of_reviews': 'number_of_reviews',
          'Number of Reviews': 'number_of_reviews',
          'Address': 'address',
          'address': 'address',
          'ADDRESS': 'address',
          'Website': 'website',
          'website': 'website',
          'WEBSITE': 'website',
          'Phone': 'phone',
          'phone': 'phone',
          'PHONE': 'phone',
          'Email': 'email',
          'email': 'email',
          'EMAIL': 'email',
          'Featured': 'featured',
          'featured': 'featured',
          'FEATURED': 'featured'
        }
        
        const mapped = headerMap[cleanHeader] || cleanHeader.toLowerCase().replace(/\s+/g, '_')
        console.log(`Mapped "${cleanHeader}" to "${mapped}"`)
        return mapped
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
    
    // Debug: Show first few rows and their headers
    if (rows.length > 0) {
      console.log('First row data:', rows[0])
      console.log('Available keys in first row:', Object.keys(rows[0]))
    }

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
        
        // Try multiple possible field names for business
        const business = typedRow.business || 
                        typedRow.Business || 
                        typedRow.BUSINESS || 
                        typedRow['Business Name'] ||
                        typedRow['business_name'] ||
                        ''
        
        const address = typedRow.address || 
                       typedRow.Address || 
                       typedRow.ADDRESS || 
                       ''
        
        console.log(`Row ${index + 1}: business="${business}", address="${address}"`)
        
        if (!business.trim()) {
          stats.skipped++
          stats.errors.push(`Row ${index + 1}: Missing business name (available fields: ${Object.keys(typedRow).join(', ')})`)
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
