import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Function to normalize text for comparison
function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeText(str1)
  const norm2 = normalizeText(str2)
  
  if (norm1 === norm2) return 1.0
  if (!norm1 || !norm2) return 0.0
  
  // Simple similarity based on common words
  const words1 = norm1.split(' ')
  const words2 = norm2.split(' ')
  const allWords = new Set([...words1, ...words2])
  const commonWords = words1.filter(word => words2.includes(word))
  
  return commonWords.length / allWords.size
}

// Function to check if two addresses are similar
function areAddressesSimilar(addr1: string, addr2: string): boolean {
  if (!addr1 || !addr2) return false
  
  const norm1 = normalizeText(addr1)
  const norm2 = normalizeText(addr2)
  
  // Exact match
  if (norm1 === norm2) return true
  
  // Check if one contains the other (for partial addresses)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true
  
  // Check similarity score
  return calculateSimilarity(addr1, addr2) > 0.7
}

// Function to check if two phone numbers are the same
function arePhonesSame(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false
  
  // Extract only digits
  const digits1 = phone1.replace(/\D/g, '')
  const digits2 = phone2.replace(/\D/g, '')
  
  if (!digits1 || !digits2) return false
  
  // Compare last 10 digits (US phone numbers)
  const last10_1 = digits1.slice(-10)
  const last10_2 = digits2.slice(-10)
  
  return last10_1 === last10_2 && last10_1.length === 10
}

export async function POST(request: NextRequest) {
  try {
    const { action, cityId, stateId } = await request.json()

    if (!action || !['find', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "find" or "remove"' },
        { status: 400 }
      )
    }

    // Build query based on scope
    let query = supabase
      .from('listings')
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

    if (cityId) {
      query = query.eq('city_id', cityId)
    } else if (stateId) {
      // Get all cities in the state first
      const { data: cities } = await supabase
        .from('cities')
        .select('id')
        .eq('state_id', stateId)
      
      if (cities && cities.length > 0) {
        query = query.in('city_id', cities.map(c => c.id))
      }
    }

    const { data: listings, error: fetchError } = await query.order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch listings', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({
        message: 'No listings found in the specified scope',
        stats: { total: 0, duplicates: 0, removed: 0 }
      })
    }

    console.log(`Analyzing ${listings.length} listings for duplicates...`)

    // Find duplicates
    const duplicateGroups: Array<Array<typeof listings[0]>> = []
    const processed = new Set<string>()

    for (let i = 0; i < listings.length; i++) {
      const listing1 = listings[i]
      if (processed.has(listing1.id)) continue

      const duplicates = [listing1]
      processed.add(listing1.id)

      for (let j = i + 1; j < listings.length; j++) {
        const listing2 = listings[j]
        if (processed.has(listing2.id)) continue

        let isDuplicate = false

        // Check for duplicates based on multiple criteria
        const businessSimilarity = calculateSimilarity(listing1.business, listing2.business)
        const addressSimilar = areAddressesSimilar(listing1.address, listing2.address)
        const phoneSame = arePhonesSame(listing1.phone, listing2.phone)

        // MUCH MORE CONSERVATIVE duplicate criteria - only very obvious duplicates
        if (normalizeText(listing1.business) === normalizeText(listing2.business) && 
            listing1.city_id === listing2.city_id && 
            areAddressesSimilar(listing1.address, listing2.address)) {
          // Exact same business name, same city, similar address
          isDuplicate = true
        } else if (phoneSame && 
                   normalizeText(listing1.business) === normalizeText(listing2.business) && 
                   listing1.city_id === listing2.city_id) {
          // Same phone, same business name, same city
          isDuplicate = true
        } else if (businessSimilarity > 0.95 && 
                   areAddressesSimilar(listing1.address, listing2.address) && 
                   listing1.city_id === listing2.city_id) {
          // Very high similarity (95%+) with same address and city
          isDuplicate = true
        }

        if (isDuplicate) {
          duplicates.push(listing2)
          processed.add(listing2.id)
        }
      }

      if (duplicates.length > 1) {
        duplicateGroups.push(duplicates)
      }
    }

    const stats = {
      total: listings.length,
      duplicateGroups: duplicateGroups.length,
      duplicates: duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0), // Total duplicates (excluding one original per group)
      removed: 0
    }

    if (action === 'find') {
      // Just return the duplicate groups for preview
      const duplicateInfo = duplicateGroups.map(group => ({
        originalListing: {
          id: group[0].id,
          business: group[0].business,
          address: group[0].address,
          phone: group[0].phone,
          city: group[0].cities?.name,
          state: group[0].cities?.states?.name,
          created_at: group[0].created_at
        },
        duplicates: group.slice(1).map(listing => ({
          id: listing.id,
          business: listing.business,
          address: listing.address,
          phone: listing.phone,
          city: listing.cities?.name,
          state: listing.cities?.states?.name,
          created_at: listing.created_at
        }))
      }))

      return NextResponse.json({
        message: `Found ${stats.duplicates} duplicate listings in ${stats.duplicateGroups} groups`,
        stats,
        duplicates: duplicateInfo
      })

    } else if (action === 'remove') {
      // Remove duplicates (keep the oldest one in each group)
      const idsToRemove: string[] = []
      
      duplicateGroups.forEach(group => {
        // Sort by created_at to keep the oldest
        group.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        
        // Remove all except the first (oldest)
        for (let i = 1; i < group.length; i++) {
          idsToRemove.push(group[i].id)
        }
      })

      if (idsToRemove.length > 0) {
        // SAFETY CHECK: Don't allow removing more than 50% of listings
        const maxRemovable = Math.floor(listings.length * 0.5)
        if (idsToRemove.length > maxRemovable) {
          return NextResponse.json(
            { 
              error: `SAFETY BLOCKED: Would remove ${idsToRemove.length} listings (${Math.round(idsToRemove.length/listings.length*100)}% of total). Maximum allowed: ${maxRemovable} (50%). Please review duplicates manually.`,
              stats: {
                ...stats,
                blocked: true,
                wouldRemove: idsToRemove.length,
                maxAllowed: maxRemovable
              }
            },
            { status: 400 }
          )
        }

        console.log(`Removing ${idsToRemove.length} duplicate listings...`)
        
        const { error: deleteError } = await supabase
          .from('listings')
          .delete()
          .in('id', idsToRemove)

        if (deleteError) {
          return NextResponse.json(
            { error: 'Failed to remove duplicates', details: deleteError.message },
            { status: 500 }
          )
        }

        stats.removed = idsToRemove.length
      }

      return NextResponse.json({
        message: `Successfully removed ${stats.removed} duplicate listings`,
        stats
      })
    }

  } catch (error) {
    console.error('Duplicate removal error:', error)
    return NextResponse.json(
      { error: 'Duplicate removal failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
