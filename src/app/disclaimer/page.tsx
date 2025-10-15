export const metadata = {
  title: 'Disclaimer',
  description: 'Important disclaimers about the information provided on this site.'
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
        <p className="text-gray-700 mb-4">The information on this site is for general informational purposes only. We make no guarantees of accuracy or completeness.</p>
        <p className="text-gray-700 mb-2">Any reliance you place on such information is strictly at your own risk.</p>
        <p className="text-gray-700">We are not responsible for any losses or damages in connection with the use of our website.</p>
      </div>
    </div>
  )
}


