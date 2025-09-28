import { NextRequest, NextResponse } from 'next/server'
import { sendFeaturedListingNotification, sendConfirmationEmail } from '@/lib/email'

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint - use POST to test email functionality',
    usage: 'Send a POST request to this endpoint to test email service'
  })
}

export async function POST(request: NextRequest) {
  try {
    // Test data
    const testApplication = {
      businessName: 'Test Business',
      contactName: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890',
      website: 'https://test.com',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      category: 'Test Category',
      description: 'This is a test application',
      applicationId: 'TEST-' + Date.now()
    }

    console.log('Testing email service...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL)

    // Test admin notification
    console.log('Testing admin notification...')
    const adminResult = await sendFeaturedListingNotification(testApplication)
    console.log('Admin email result:', adminResult)

    // Test confirmation email
    console.log('Testing confirmation email...')
    const confirmationResult = await sendConfirmationEmail(testApplication)
    console.log('Confirmation email result:', confirmationResult)

    return NextResponse.json({
      success: true,
      message: 'Email test completed',
      results: {
        adminEmail: adminResult,
        confirmationEmail: confirmationResult
      },
      environment: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        adminEmail: process.env.ADMIN_EMAIL
      }
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
