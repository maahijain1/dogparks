import { supabaseAdmin as supabase } from '@/lib/supabase'

export interface CityTemplateData {
  CITY_NAME: string
  STATE_NAME: string
  ZIP_CODE: string
  POPULATION: string
  CITY_ESTABLISHED: string
  COUNTY_NAME: string
  NEARBY_AREAS: string
  NEARBY_CITIES: string
  SITE_NAME: string
  NICHE: string
  PHONE_NUMBER: string
  YEARS_IN_BUSINESS: string
  HERO_IMAGE: string
}

export async function getCityTemplateData(cityId: string): Promise<CityTemplateData> {
  try {
    // Get city data with state information
    const { data: cityData, error: cityError } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        slug,
        states (
          id,
          name
        )
      `)
      .eq('id', cityId)
      .single()

    if (cityError || !cityData) {
      throw new Error(`City not found: ${cityError?.message}`)
    }

    // Get site settings
    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['site_name', 'niche', 'phone_number'])

    const settings = siteSettings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>) || {}

    // Get nearby cities (within same state)
    const { data: nearbyCities } = await supabase
      .from('cities')
      .select('name')
      .eq('state_id', (cityData.states as unknown as Record<string, unknown>)?.id)
      .neq('id', cityId)
      .limit(5)

    // Get listings count for this city
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', cityId)

    const stateName = (cityData.states as unknown as Record<string, unknown>)?.name
    const nearbyCitiesList = nearbyCities?.map(c => c.name).join(', ') || ''

    return {
      CITY_NAME: cityData.name,
      STATE_NAME: String(stateName) || 'Unknown State',
      ZIP_CODE: '28027', // Default zip code - you might want to add this to your cities table
      POPULATION: '15,000+', // Default population - you might want to add this to your cities table
      CITY_ESTABLISHED: '1900s', // Default - you might want to add this to your cities table
      COUNTY_NAME: `${cityData.name} County`, // Default county name
      NEARBY_AREAS: nearbyCitiesList || 'Surrounding neighborhoods',
      NEARBY_CITIES: nearbyCitiesList || 'Nearby cities',
      SITE_NAME: settings.site_name || 'Professional Services',
      NICHE: settings.niche || 'Service',
      PHONE_NUMBER: settings.phone_number || '(555) 123-4567',
      YEARS_IN_BUSINESS: '15+',
      HERO_IMAGE: '/hero-background.jpg' // Default hero image
    }
  } catch (error) {
    console.error('Error getting city template data:', error)
    // Return default data
    return {
      CITY_NAME: 'Unknown City',
      STATE_NAME: 'Unknown State',
      ZIP_CODE: '00000',
      POPULATION: '10,000+',
      CITY_ESTABLISHED: '1900s',
      COUNTY_NAME: 'Unknown County',
      NEARBY_AREAS: 'Surrounding areas',
      NEARBY_CITIES: 'Nearby cities',
      SITE_NAME: 'Professional Services',
      NICHE: 'Service',
      PHONE_NUMBER: '(555) 123-4567',
      YEARS_IN_BUSINESS: '10+',
      HERO_IMAGE: '/hero-background.jpg'
    }
  }
}

export function generateCityPageContent(templateData: CityTemplateData): string {
  const template = `
    <div class="header">
      <div class="container">
        <h1>Professional ${templateData.NICHE} Services in ${templateData.CITY_NAME}</h1>
        <p class="subtitle">Serving ${templateData.CITY_NAME} with professional ${templateData.NICHE} services</p>
        <a href="tel:${templateData.PHONE_NUMBER}" class="cta-button">Call ${templateData.PHONE_NUMBER} Now</a>
      </div>
    </div>

    <div class="container">
      <div class="main-content">
        <div class="hero-section">
          <h2>Local ${templateData.NICHE} Experts</h2>
          <p>When you need reliable ${templateData.NICHE} in ${templateData.CITY_NAME}, trust the local experts at ${templateData.SITE_NAME}. Our team has been serving the ${templateData.ZIP_CODE} area for over ${templateData.YEARS_IN_BUSINESS} years, providing fast, professional ${templateData.NICHE} solutions for both emergency situations and planned maintenance.</p>
          <p>From minor ${templateData.NICHE} repairs to extensive ${templateData.NICHE} restoration, our experienced technicians understand the unique ${templateData.NICHE} challenges faced by ${templateData.CITY_NAME} residents. We use premium materials designed to withstand ${templateData.STATE_NAME}'s diverse weather conditions while maintaining your property's aesthetic appeal.</p>
        </div>

        <div class="content-section">
          <h3>Expert ${templateData.NICHE} Services in ${templateData.CITY_NAME}</h3>
          <p>Our comprehensive ${templateData.NICHE} services include:</p>
          
          <div class="services-grid">
            <div class="service-card">
              <h4>Emergency Services</h4>
              <ul class="service-list">
                <li>Emergency ${templateData.NICHE} repairs</li>
                <li>Storm damage restoration</li>
                <li>24/7 emergency response</li>
                <li>Rapid response team</li>
              </ul>
            </div>
            
            <div class="service-card">
              <h4>Professional Services</h4>
              <ul class="service-list">
                <li>${templateData.NICHE} replacement and repair</li>
                <li>Preventive maintenance</li>
                <li>Quality inspections</li>
                <li>Expert consultations</li>
              </ul>
            </div>
            
            <div class="service-card">
              <h4>Specialized Solutions</h4>
              <ul class="service-list">
                <li>Custom ${templateData.NICHE} solutions</li>
                <li>Advanced technology</li>
                <li>Eco-friendly options</li>
                <li>Warranty protection</li>
              </ul>
            </div>
          </div>

          <p>As your neighbors in ${templateData.CITY_NAME}, we take pride in maintaining the beauty and integrity of ${templateData.CITY_NAME} properties. Every ${templateData.NICHE} project comes with our satisfaction guarantee and is backed by our comprehensive warranty.</p>
        </div>

        <div class="area-info">
          <h4>About ${templateData.CITY_NAME}</h4>
          <p><strong>Zip Code:</strong> ${templateData.ZIP_CODE}</p>
          <p><strong>Service Area:</strong> ${templateData.CITY_NAME} and surrounding neighborhoods</p>
          <p><strong>Population:</strong> ${templateData.POPULATION}</p>
          <p><strong>Established:</strong> ${templateData.CITY_ESTABLISHED}</p>
          
          <h4 style="margin-top: 1.5rem;">Nearby Areas We Serve</h4>
          <p>Proudly serving ${templateData.CITY_NAME} and surrounding ${templateData.STATE_NAME} neighborhoods including ${templateData.NEARBY_AREAS}. Our service area extends throughout ${templateData.COUNTY_NAME} County, providing quick response times for both scheduled and emergency ${templateData.NICHE} services.</p>
        </div>

        <div class="content-section">
          <h3>Why Choose ${templateData.SITE_NAME} in ${templateData.CITY_NAME}?</h3>
          <div class="services-grid">
            <div class="service-card">
              <h4>Local Expertise</h4>
              <p>We understand ${templateData.CITY_NAME}'s unique ${templateData.NICHE} needs and local building codes. Our team has extensive experience working in ${templateData.CITY_NAME} and surrounding areas.</p>
            </div>
            
            <div class="service-card">
              <h4>Fast Response</h4>
              <p>When you need ${templateData.NICHE} services in ${templateData.CITY_NAME}, we're just a phone call away. Our local team provides rapid response times for all ${templateData.CITY_NAME} residents.</p>
            </div>
            
            <div class="service-card">
              <h4>Quality Guarantee</h4>
              <p>Every ${templateData.NICHE} project in ${templateData.CITY_NAME} comes with our satisfaction guarantee. We stand behind our work with comprehensive warranties.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <h3>Get ${templateData.NICHE} Service in ${templateData.CITY_NAME}</h3>
        <p>Contact us today for professional service and free estimates</p>
        <a href="tel:${templateData.PHONE_NUMBER}" class="cta-button">Call Now</a>
        
        <div class="guarantee">
          Free Estimates • Licensed & Insured • ${templateData.YEARS_IN_BUSINESS} Years Experience
        </div>
        
        <div class="contact-info">
          <div class="contact-item">
            <h4>${templateData.SITE_NAME}</h4>
            <p>Professional ${templateData.NICHE} services you can trust in ${templateData.CITY_NAME}.</p>
            <p class="phone-number">${templateData.PHONE_NUMBER}</p>
            <p>Serving ${templateData.CITY_NAME} & Surrounding Areas</p>
          </div>
          
          <div class="contact-item">
            <h4>Service Areas</h4>
            <p>${templateData.CITY_NAME}</p>
            <p>${templateData.NEARBY_CITIES}</p>
            <p>And all of ${templateData.COUNTY_NAME} County</p>
          </div>
          
          <div class="contact-item">
            <h4>Our Services</h4>
            <p>Emergency ${templateData.NICHE}</p>
            <p>Preventive Maintenance</p>
            <p>Quality Inspections</p>
            <p>Expert Consultations</p>
          </div>
        </div>
      </div>
    </div>
  `

  return template
}

export function getCityPageStyles(): string {
  return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f9fa;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .header {
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        color: white;
        padding: 2rem 0;
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }
      
      .header .subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 1rem;
      }
      
      .cta-button {
        display: inline-block;
        background: #e74c3c;
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        font-size: 1.1rem;
        transition: background 0.3s ease;
        margin: 10px;
      }
      
      .cta-button:hover {
        background: #c0392b;
      }
      
      .main-content {
        background: white;
        margin: 2rem 0;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      
      .hero-section {
        background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/hero-background.jpg');
        background-size: cover;
        background-position: center;
        color: white;
        padding: 4rem 2rem;
        text-align: center;
      }
      
      .hero-section h2 {
        font-size: 2.2rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .hero-section p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.95;
      }
      
      .content-section {
        padding: 3rem 2rem;
      }
      
      .content-section h3 {
        color: #2c3e50;
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
        border-bottom: 3px solid #3498db;
        padding-bottom: 0.5rem;
      }
      
      .content-section p {
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
        line-height: 1.7;
      }
      
      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
      }
      
      .service-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #3498db;
        transition: transform 0.3s ease;
      }
      
      .service-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .service-card h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.3rem;
      }
      
      .service-list {
        list-style: none;
        padding: 0;
      }
      
      .service-list li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #ecf0f1;
        position: relative;
        padding-left: 1.5rem;
      }
      
      .service-list li:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #27ae60;
        font-weight: bold;
      }
      
      .area-info {
        background: #ecf0f1;
        padding: 2rem;
        border-radius: 8px;
        margin: 2rem 0;
      }
      
      .area-info h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.4rem;
      }
      
      .area-info p {
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .contact-section {
        background: #2c3e50;
        color: white;
        padding: 3rem 2rem;
        text-align: center;
      }
      
      .contact-section h3 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      
      .contact-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
      }
      
      .contact-item {
        background: rgba(255,255,255,0.1);
        padding: 1.5rem;
        border-radius: 8px;
      }
      
      .contact-item h4 {
        margin-bottom: 0.5rem;
        color: #3498db;
      }
      
      .phone-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #e74c3c;
      }
      
      .guarantee {
        background: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        text-align: center;
        margin: 1rem 0;
        font-weight: bold;
      }
      
      @media (max-width: 768px) {
        .header h1 {
          font-size: 2rem;
        }
        
        .hero-section h2 {
          font-size: 1.8rem;
        }
        
        .services-grid {
          grid-template-columns: 1fr;
        }
        
        .contact-info {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `
}
