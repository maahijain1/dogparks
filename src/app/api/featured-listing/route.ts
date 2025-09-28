import { NextRequest, NextResponse } from 'next/server'
import { sendFeaturedListingNotification, sendConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      businessName, 
      contactName, 
      email, 
      phone, 
      website, 
      address, 
      city, 
      state, 
      category, 
      description 
    } = body

    // Validate required fields
    if (!businessName || !contactName || !email || !phone || !address || !city || !state || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate application ID
    const applicationId = `FL-${Date.now()}`

    // Create application object
    const application = {
      businessName,
      contactName,
      email,
      phone,
      website,
      address,
      city,
      state,
      category,
      description,
      applicationId
    }

    // Log the submission
    console.log('Featured Listing Application:', {
      ...application,
      submittedAt: new Date().toISOString()
    })

    // Send email notifications
    try {
      // Send notification to admin
      const adminEmailResult = await sendFeaturedListingNotification(application)
      if (!adminEmailResult.success) {
        console.error('Failed to send admin notification:', adminEmailResult.error)
      }

      // Send confirmation to business owner
      const confirmationEmailResult = await sendConfirmationEmail(application)
      if (!confirmationEmailResult.success) {
        console.error('Failed to send confirmation email:', confirmationEmailResult.error)
      }
    } catch (emailError) {
      console.error('Email service error:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      { 
        message: 'Application submitted successfully',
        applicationId
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error processing featured listing application:', error)
    return NextResponse.json(
      { error: 'Failed to process application' },
      { status: 500 }
    )
  }
}




