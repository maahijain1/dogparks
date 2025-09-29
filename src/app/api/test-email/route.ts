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
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL)

    // Test both emails using the new combined function
    console.log('Testing both admin notification and customer confirmation...')
    const bothResults = await sendBothEmails(testApplication)
    console.log('Both emails result:', bothResults)

    // Also test individual functions for detailed results
    console.log('Testing admin notification individually...')
    const adminResult = await sendFeaturedListingNotification(testApplication)
    console.log('Admin email result:', adminResult)

    console.log('Testing confirmation email individually...')
    const confirmationResult = await sendConfirmationEmail(testApplication)
    console.log('Confirmation email result:', confirmationResult)

    return NextResponse.json({
      success: true,
      message: 'Email test completed',
      results: {
        combinedTest: bothResults,
        individualTests: {
          adminEmail: adminResult,
          confirmationEmail: confirmationResult
        }
      },
      environment: {
        hasResendKey: !!process.env.RESEND_API_KEY,
        adminEmail: process.env.ADMIN_EMAIL,
        resendConfigured: !!resend
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
