import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | DirectoryHub',
  description: 'Learn how DirectoryHub protects your privacy and handles your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              DirectoryHub
            </Link>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Your privacy is important to us
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
            <p className="text-lg text-gray-700 mb-8">
              DirectoryHub (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website and use our services.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Information We Collect</h2>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Personal Information</h3>
            <p className="text-lg text-gray-700 mb-6">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="text-lg text-gray-700 space-y-2 mb-8">
              <li>• Register for an account</li>
              <li>• Contact us through our website</li>
              <li>• Subscribe to our newsletter</li>
              <li>• Submit business listings</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Automatically Collected Information</h3>
            <p className="text-lg text-gray-700 mb-6">
              We may automatically collect certain information about your device and usage patterns, including:
            </p>
            <ul className="text-lg text-gray-700 space-y-2 mb-8">
              <li>• IP address and location data</li>
              <li>• Browser type and version</li>
              <li>• Pages visited and time spent on our site</li>
              <li>• Referring website information</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
            <p className="text-lg text-gray-700 mb-6">
              We use the information we collect to:
            </p>
            <ul className="text-lg text-gray-700 space-y-2 mb-8">
              <li>• Provide and maintain our services</li>
              <li>• Improve our website and user experience</li>
              <li>• Communicate with you about our services</li>
              <li>• Process business listing submissions</li>
              <li>• Analyze usage patterns and trends</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Information Sharing</h2>
            <p className="text-lg text-gray-700 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except in the following circumstances:
            </p>
            <ul className="text-lg text-gray-700 space-y-2 mb-8">
              <li>• With service providers who assist us in operating our website</li>
              <li>• When required by law or to protect our rights</li>
              <li>• In connection with a business transfer or acquisition</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
            <p className="text-lg text-gray-700 mb-8">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies and Tracking</h2>
            <p className="text-lg text-gray-700 mb-8">
              We use cookies and similar tracking technologies to enhance your experience on our website. 
              You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights</h2>
            <p className="text-lg text-gray-700 mb-6">
              You have the right to:
            </p>
            <ul className="text-lg text-gray-700 space-y-2 mb-8">
              <li>• Access your personal information</li>
              <li>• Correct inaccurate information</li>
              <li>• Delete your personal information</li>
              <li>• Opt-out of marketing communications</li>
              <li>• Withdraw consent for data processing</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Links</h2>
            <p className="text-lg text-gray-700 mb-8">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
            <p className="text-lg text-gray-700 mb-8">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-lg text-gray-700 mb-8">
              If you have any questions about this Privacy Policy, please contact us through our{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                contact page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">We Protect Your Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Data</h3>
              <p className="text-gray-600">
                Your information is protected with industry-standard security measures.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Selling</h3>
              <p className="text-gray-600">
                We never sell your personal information to third parties.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600">
                We&apos;re transparent about how we collect and use your data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}







