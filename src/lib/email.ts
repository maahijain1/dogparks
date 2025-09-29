import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Helper function to get the appropriate email address based on environment
const getAdminEmail = () => {
  // In production with domain verification, use ADMIN_EMAIL
  // In development/free tier, use verified email
  return process.env.NODE_ENV === 'production' && process.env.ADMIN_EMAIL 
    ? process.env.ADMIN_EMAIL 
    : 'bankonkamalakar@gmail.com'
}

const getCustomerEmail = (application: FeaturedListingApplication) => {
  // In production with domain verification, send to customer
  // In development/free tier, send to verified email
  return process.env.NODE_ENV === 'production' && process.env.RESEND_DOMAIN_VERIFIED === 'true'
    ? application.email
    : 'bankonkamalakar@gmail.com'
}

export interface FeaturedListingApplication {
  businessName: string
  contactName: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  state: string
  category: string
  description?: string
  applicationId: string
}

export async function sendFeaturedListingNotification(application: FeaturedListingApplication) {
  if (!resend) {
    console.log('Email service not configured - skipping admin notification')
    return { success: false, error: 'Email service not configured' }
  }

  // Note: Resend free tier only allows sending to verified email addresses
  // For production, verify your own domain at resend.com/domains
  console.log('Sending admin notification to verified email address')

  try {
    const { data, error } = await resend.emails.send({
      from: 'DirectoryHub <onboarding@resend.dev>', // Using Resend's verified domain
      to: [getAdminEmail()], // Use appropriate email based on environment
      subject: `🌟 New Featured Listing Application - ${application.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🌟 New Featured Listing Application</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Application ID: ${application.applicationId}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Business Information</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">${application.businessName}</h3>
              <p><strong>Category:</strong> ${application.category}</p>
              <p><strong>Contact:</strong> ${application.contactName}</p>
              <p><strong>Email:</strong> <a href="mailto:${application.email}" style="color: #667eea;">${application.email}</a></p>
              <p><strong>Phone:</strong> <a href="tel:${application.phone}" style="color: #667eea;">${application.phone}</a></p>
              ${application.website ? `<p><strong>Website:</strong> <a href="${application.website}" target="_blank" style="color: #667eea;">${application.website}</a></p>` : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Location</h3>
              <p><strong>Address:</strong> ${application.address}</p>
              <p><strong>City:</strong> ${application.city}</p>
              <p><strong>State:</strong> ${application.state}</p>
            </div>
            
            ${application.description ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0;">Business Description</h3>
              <p style="line-height: 1.6;">${application.description}</p>
            </div>
            ` : ''}
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">Next Steps</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li>Review the business information above</li>
                <li>Contact the business owner to discuss payment</li>
                <li>Set up their featured listing in the admin panel</li>
                <li>Send them the payment link (Stripe/PayPal)</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://dogparks.vercel.app'}/admin" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Admin Panel
              </a>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending email notification:', error)
      return { success: false, error }
    }

    console.log('Email notification sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email notification:', error)
    return { success: false, error }
  }
}

export async function sendConfirmationEmail(application: FeaturedListingApplication) {
  if (!resend) {
    console.log('Email service not configured - skipping confirmation email')
    return { success: false, error: 'Email service not configured' }
  }

  // Note: Resend free tier limitation - sending to verified email for testing
  // In production with domain verification, this would go to application.email
  console.log('Sending confirmation email to verified email address (free tier limitation)')

  try {
    const { data, error } = await resend.emails.send({
      from: 'DirectoryHub <onboarding@resend.dev>', // Using Resend's verified domain
      to: [getCustomerEmail(application)], // Use appropriate email based on environment
      subject: `Thank You! Your Featured Listing Application - ${application.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🌟 Thank You!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your featured listing application has been received</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Application Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p><strong>Application ID:</strong> ${application.applicationId}</p>
              <p><strong>Business Name:</strong> ${application.businessName}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <h3 style="color: #2e7d32; margin-top: 0;">What Happens Next?</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li>We'll review your application within 24 hours</li>
                <li>We'll contact you to discuss payment and setup</li>
                <li>Once payment is confirmed, your featured listing will go live</li>
                <li>You'll receive priority placement and a featured badge</li>
              </ol>
            </div>
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin-top: 20px;">
              <h3 style="color: #f57c00; margin-top: 0;">Pricing</h3>
              <p><strong>Special Launch Offer:</strong> $9/month for the first 3 months</p>
              <p><strong>Regular Rate:</strong> $19/month after the initial period</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@directoryhub.com" style="color: #667eea;">support@directoryhub.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Error sending confirmation email:', error)
      return { success: false, error }
    }

    console.log('Confirmation email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendBothEmails(application: FeaturedListingApplication) {
  console.log('Sending both admin notification and customer confirmation emails...')
  
  const adminResult = await sendFeaturedListingNotification(application)
  const confirmationResult = await sendConfirmationEmail(application)
  
  return {
    adminEmail: adminResult,
    confirmationEmail: confirmationResult,
    allSuccessful: adminResult.success && confirmationResult.success
  }
}
