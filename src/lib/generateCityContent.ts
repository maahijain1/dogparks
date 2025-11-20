/**
 * Dynamic Content Generator for City Pages
 * Generates unique, SEO-friendly content for each city
 */

interface CityContentData {
    cityName: string
    stateName: string
    stateAbbr: string
    listingCount: number
    niche: string
}

// Content variation templates to create unique content
const introTemplates = [
    (d: CityContentData) => `Looking for quality ${d.niche.toLowerCase()} in ${d.cityName}, ${d.stateAbbr}? You've come to the right place. Our comprehensive directory features ${d.listingCount} verified ${d.niche.toLowerCase()} facilities serving the ${d.cityName} area.`,

    (d: CityContentData) => `${d.cityName}, ${d.stateName} is home to ${d.listingCount} trusted ${d.niche.toLowerCase()} facilities. Whether you're a local resident or just visiting, finding the perfect place for your furry friend has never been easier.`,

    (d: CityContentData) => `Discover ${d.listingCount} top-rated ${d.niche.toLowerCase()} options in ${d.cityName}, ${d.stateAbbr}. From luxury suites to budget-friendly options, we've compiled the most comprehensive list of boarding facilities in the area.`,

    (d: CityContentData) => `Planning a trip and need reliable ${d.niche.toLowerCase()} in ${d.cityName}? Browse our directory of ${d.listingCount} verified facilities, complete with reviews, ratings, and contact information.`,
]

const whyChooseTemplates = [
    (d: CityContentData) => `${d.cityName} offers a variety of ${d.niche.toLowerCase()} options to suit every dog's needs and every budget. From facilities with spacious outdoor play areas to those offering specialized care for senior dogs or puppies, you'll find the perfect match here. The ${d.cityName} community is known for its love of pets, and local boarding facilities reflect this commitment to quality care.`,

    (d: CityContentData) => `What makes ${d.cityName}'s ${d.niche.toLowerCase()} facilities special? Many offer 24/7 supervision, webcam access, grooming services, and even training programs. The ${d.cityName} area is known for its pet-friendly community and high-quality care standards. Local facilities pride themselves on creating a home-away-from-home experience for your furry family members.`,

    (d: CityContentData) => `The ${d.niche.toLowerCase()} facilities in ${d.cityName}, ${d.stateName} pride themselves on providing safe, comfortable, and fun environments for your pets. Most facilities are staffed by trained professionals who genuinely love animals and understand the importance of maintaining your dog's routine and comfort while you're away.`,
]

const whatToLookForTemplates = [
    (d: CityContentData) => `When choosing ${d.niche.toLowerCase()} in ${d.cityName}, consider factors like staff-to-dog ratio, cleanliness, play area size, and emergency veterinary protocols. Don't hesitate to schedule a tour before making your decision. A reputable facility will be happy to show you around and answer all your questions about their care procedures, safety measures, and daily routines.`,

    (d: CityContentData) => `Before selecting a ${d.niche.toLowerCase().slice(0, -1)} facility in ${d.cityName}, check their vaccination requirements, cancellation policies, and what's included in the daily rate. Reading reviews from other ${d.cityName} pet owners can also provide valuable insights. Look for facilities that offer trial stays or meet-and-greet sessions so your dog can get comfortable with the environment before an extended stay.`,

    (d: CityContentData) => `Important considerations when booking ${d.niche.toLowerCase()} in ${d.cityName} include: facility cleanliness, staff qualifications, available amenities, and proximity to veterinary care. Most reputable facilities offer trial stays or meet-and-greet sessions. Ask about their emergency protocols, how they handle medical situations, and what their typical daily schedule includes for exercise, feeding, and rest times.`,
]

const servicesTemplates = [
    (d: CityContentData) => `Many ${d.niche.toLowerCase()} facilities in ${d.cityName} offer additional services beyond basic boarding, including grooming, training, daycare, and specialized medical care. Some even provide luxury amenities like private suites, swimming pools, and one-on-one playtime. Whether your dog needs basic overnight care or a full spa experience, you'll find options that fit your needs and budget in ${d.cityName}.`,

    (d: CityContentData) => `${d.cityName}'s ${d.niche.toLowerCase()} facilities typically offer a range of services: standard kennels, luxury suites, group play sessions, individual walks, medication administration, and special dietary accommodations. Many also provide photo updates and daily report cards so you can stay connected with your pet while you're away. Some facilities even offer webcam access for real-time viewing.`,

    (d: CityContentData) => `From basic overnight stays to premium spa packages, ${d.cityName} ${d.niche.toLowerCase()} facilities cater to all needs. Common services include climate-controlled rooms, outdoor play areas, socialization sessions, and personalized care plans for dogs with special requirements. Many facilities also offer add-on services like nail trimming, teeth brushing, and special treats to make your dog's stay extra comfortable.`,
]

const closingTemplates = [
    (d: CityContentData) => `Ready to find the perfect ${d.niche.toLowerCase().slice(0, -1)} facility in ${d.cityName}? Browse our listings above, read reviews from other pet parents, and contact facilities directly to schedule tours. Your dog deserves the best care while you're away, and ${d.cityName} has excellent options to choose from!`,

    (d: CityContentData) => `Finding quality ${d.niche.toLowerCase()} in ${d.cityName}, ${d.stateAbbr} doesn't have to be stressful. Use our directory to compare facilities, check availability, and make informed decisions. Most facilities are happy to answer questions and show you around. Don't forget to book early, especially during peak travel seasons and holidays!`,

    (d: CityContentData) => `Whether you need ${d.niche.toLowerCase()} for a weekend getaway or an extended vacation, ${d.cityName} has excellent options. Start by browsing the ${d.listingCount} facilities listed above, and don't forget to book early during peak travel seasons. Your peace of mind is worth the time spent finding the right fit for your furry friend!`,
]

/**
 * Generates unique, visually rich content for a city page (500+ words)
 * Uses hash of city name to select consistent but varied templates
 */
export function generateCityContent(data: CityContentData): string {
    const hash = data.cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const intro = introTemplates[hash % introTemplates.length](data)
    const whyChoose = whyChooseTemplates[(hash + 1) % whyChooseTemplates.length](data)
    const whatToLookFor = whatToLookForTemplates[(hash + 2) % whatToLookForTemplates.length](data)
    const services = servicesTemplates[(hash + 3) % servicesTemplates.length](data)
    const closing = closingTemplates[(hash + 4) % closingTemplates.length](data)

    return `
    <div class="city-content space-y-8">
      <!-- Hero Introduction with Icon -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600 shadow-sm">
        <div class="flex items-start gap-4">
          <svg class="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg leading-relaxed text-gray-800">${intro}</p>
        </div>
      </div>
      
      <!-- Key Benefits Grid -->
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-white border-2 border-green-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-green-100 rounded-full p-2">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900">Verified Facilities</h3>
          </div>
          <p class="text-sm text-gray-600">All ${data.listingCount} facilities are verified and reviewed by real pet owners</p>
        </div>
        
        <div class="bg-white border-2 border-blue-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-blue-100 rounded-full p-2">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900">Top Rated</h3>
          </div>
          <p class="text-sm text-gray-600">Compare ratings, reviews, and prices from trusted sources</p>
        </div>
        
        <div class="bg-white border-2 border-purple-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-purple-100 rounded-full p-2">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <h3 class="font-bold text-gray-900">Local Experts</h3>
          </div>
          <p class="text-sm text-gray-600">Run by experienced ${data.cityName} pet care professionals</p>
        </div>
      </div>
      
      <!-- Why Choose Section -->
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Why Choose ${data.cityName} for ${data.niche}?
        </h2>
        <p class="text-gray-700 leading-relaxed text-lg mb-6">${whyChoose}</p>
      </div>
      
      <!-- What to Look For Section with Checklist -->
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          What to Look For When Choosing a Facility
        </h2>
        <p class="text-gray-700 leading-relaxed text-lg mb-6">${whatToLookFor}</p>
        
        <!-- Essential Checklist -->
        <div class="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
            <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            Essential Checklist for ${data.cityName} Pet Owners
          </h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700"><strong>Verify credentials:</strong> Check vaccination requirements and health protocols</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700"><strong>Schedule a tour:</strong> Visit the facility before booking to see conditions firsthand</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700"><strong>Ask about staffing:</strong> Inquire about staff-to-dog ratios and 24/7 supervision</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700"><strong>Review policies:</strong> Understand cancellation policies and what's included in rates</span>
            </li>
            <li class="flex items-start gap-3">
              <svg class="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="text-gray-700"><strong>Emergency preparedness:</strong> Confirm proximity to veterinary care and emergency protocols</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Services Section with Visual Grid -->
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          Services Available in ${data.cityName}
        </h2>
        <p class="text-gray-700 leading-relaxed text-lg mb-6">${services}</p>
        
        <!-- Services Grid -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-100 hover:shadow-md transition-shadow">
            <div class="bg-blue-600 rounded-lg p-3 flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-lg">Overnight Boarding</h3>
              <p class="text-sm text-gray-600">Safe, comfortable accommodations with climate control and cozy bedding for extended stays</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-white rounded-lg border-2 border-green-100 hover:shadow-md transition-shadow">
            <div class="bg-green-600 rounded-lg p-3 flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-lg">Daycare Services</h3>
              <p class="text-sm text-gray-600">Socialization, exercise, and supervised play during business hours for active dogs</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-100 hover:shadow-md transition-shadow">
            <div class="bg-purple-600 rounded-lg p-3 flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-lg">Grooming & Spa</h3>
              <p class="text-sm text-gray-600">Professional grooming, bathing, nail trimming, and pampering services available</p>
            </div>
          </div>
          
          <div class="flex items-start gap-4 p-5 bg-gradient-to-br from-orange-50 to-white rounded-lg border-2 border-orange-100 hover:shadow-md transition-shadow">
            <div class="bg-orange-600 rounded-lg p-3 flex-shrink-0">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-lg">Medical Care</h3>
              <p class="text-sm text-gray-600">Medication administration, special dietary needs, and health monitoring services</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Call to Action Box -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div class="flex items-start gap-4">
          <svg class="w-12 h-12 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
          </svg>
          <div>
            <h3 class="text-2xl font-bold mb-3">Ready to Find the Perfect Facility?</h3>
            <p class="text-blue-100 leading-relaxed text-lg">${closing}</p>
          </div>
        </div>
      </div>
      
      <!-- Pro Tips Section -->
      <div class="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2 text-xl">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          Pro Tips for ${data.cityName} Pet Owners
        </h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Book early during holidays and peak travel seasons to ensure availability</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Bring your dog's favorite toys, blanket, or bedding for comfort</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Update all vaccination records and provide copies to the facility</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Ask about webcam access to check on your pet remotely</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Consider a trial daycare visit before an extended boarding stay</span>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-blue-600 font-bold text-xl">•</span>
            <span class="text-gray-700">Provide detailed feeding instructions and emergency contact information</span>
          </div>
        </div>
      </div>
    </div>
  `.trim()
}

/**
 * Generates plain text content for meta description
 */
export function generateCityMetaDescription(data: CityContentData): string {
    const templates = [
        `Find ${data.listingCount} trusted ${data.niche.toLowerCase()} in ${data.cityName}, ${data.stateAbbr}. Compare facilities, read reviews, and book the perfect place for your dog. Quality care guaranteed.`,

        `Discover top-rated ${data.niche.toLowerCase()} in ${data.cityName}, ${data.stateName}. Browse ${data.listingCount} verified facilities with reviews, ratings, and pricing. Find your perfect match today!`,

        `Looking for ${data.niche.toLowerCase()} in ${data.cityName}? Compare ${data.listingCount} local facilities, check availability, and read real reviews. Safe, comfortable care for your furry friend.`,
    ]

    const hash = data.cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return templates[hash % templates.length]
}
