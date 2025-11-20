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
    (d: CityContentData) => `${d.cityName} offers a variety of ${d.niche.toLowerCase()} options to suit every dog's needs and every budget. From facilities with spacious outdoor play areas to those offering specialized care for senior dogs or puppies, you'll find the perfect match here.`,

    (d: CityContentData) => `What makes ${d.cityName}'s ${d.niche.toLowerCase()} facilities special? Many offer 24/7 supervision, webcam access, grooming services, and even training programs. The ${d.cityName} area is known for its pet-friendly community and high-quality care standards.`,

    (d: CityContentData) => `The ${d.niche.toLowerCase()} facilities in ${d.cityName}, ${d.stateName} pride themselves on providing safe, comfortable, and fun environments for your pets. Most facilities are staffed by trained professionals who genuinely love animals.`,
]

const whatToLookForTemplates = [
    (d: CityContentData) => `When choosing ${d.niche.toLowerCase()} in ${d.cityName}, consider factors like staff-to-dog ratio, cleanliness, play area size, and emergency veterinary protocols. Don't hesitate to schedule a tour before making your decision.`,

    (d: CityContentData) => `Before selecting a ${d.niche.toLowerCase().slice(0, -1)} facility in ${d.cityName}, check their vaccination requirements, cancellation policies, and what's included in the daily rate. Reading reviews from other ${d.cityName} pet owners can also provide valuable insights.`,

    (d: CityContentData) => `Important considerations when booking ${d.niche.toLowerCase()} in ${d.cityName} include: facility cleanliness, staff qualifications, available amenities, and proximity to veterinary care. Most reputable facilities offer trial stays or meet-and-greet sessions.`,
]

const servicesTemplates = [
    (d: CityContentData) => `Many ${d.niche.toLowerCase()} facilities in ${d.cityName} offer additional services beyond basic boarding, including grooming, training, daycare, and specialized medical care. Some even provide luxury amenities like private suites, swimming pools, and one-on-one playtime.`,

    (d: CityContentData) => `${d.cityName}'s ${d.niche.toLowerCase()} facilities typically offer a range of services: standard kennels, luxury suites, group play sessions, individual walks, medication administration, and special dietary accommodations. Many also provide photo updates and daily report cards.`,

    (d: CityContentData) => `From basic overnight stays to premium spa packages, ${d.cityName} ${d.niche.toLowerCase()} facilities cater to all needs. Common services include climate-controlled rooms, outdoor play areas, socialization sessions, and personalized care plans for dogs with special requirements.`,
]

const closingTemplates = [
    (d: CityContentData) => `Ready to find the perfect ${d.niche.toLowerCase().slice(0, -1)} facility in ${d.cityName}? Browse our listings above, read reviews from other pet parents, and contact facilities directly to schedule tours. Your dog deserves the best care while you're away!`,

    (d: CityContentData) => `Finding quality ${d.niche.toLowerCase()} in ${d.cityName}, ${d.stateAbbr} doesn't have to be stressful. Use our directory to compare facilities, check availability, and make informed decisions. Most facilities are happy to answer questions and show you around.`,

    (d: CityContentData) => `Whether you need ${d.niche.toLowerCase()} for a weekend getaway or an extended vacation, ${d.cityName} has excellent options. Start by browsing the ${d.listingCount} facilities listed above, and don't forget to book early during peak travel seasons!`,
]
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
