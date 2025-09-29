import { NextRequest, NextResponse } from 'next/server'
import { sendFeaturedListingNotification, sendConfirmationEmail, sendBothEmails } from '@/lib/email'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
    console.log('ADMIN_EMAIL from env:', process.env.ADMIN_EMAIL)
    console.log('Using verified email for all tests:', 'bankonkamalakar@gmail.com')

    // Test only admin notification to avoid rate limiting
    console.log('Testing admin notification email...')
    const adminResult = await sendFeaturedListingNotification(testApplication)
    console.log('Admin email result:', adminResult)

    // Add delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))

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
        adminEmail: process.env.ADMIN_EMAIL,
        resendConfigured: !!resend,
        actualRecipient: 'bankonkamalakar@gmail.com (verified)',
        note: 'All emails sent to verified address due to Resend free tier limitations'
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
