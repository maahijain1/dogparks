export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our directory site.'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-700 mb-4">Welcome to our directory site. By accessing or using this website, you agree to be bound by these Terms.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Use of the Site</h2>
        <p className="text-gray-700 mb-2">You agree to use the site lawfully and not to submit false, misleading, or harmful content.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Listings & Content</h2>
        <p className="text-gray-700 mb-2">Business listings and articles are provided for information only and may change without notice.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
        <p className="text-gray-700 mb-2">We are not liable for any losses resulting from your use of the site.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p className="text-gray-700">If you have questions, contact us at info@directoryhub.com.</p>
      </div>
    </div>
  )
}


