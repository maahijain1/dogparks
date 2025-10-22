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

    // Get listings count for this city (not used but kept for potential future use)
    await supabase
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
  // Read the full HTML template
  const fs = require('fs') // eslint-disable-line @typescript-eslint/no-require-imports
  const path = require('path') // eslint-disable-line @typescript-eslint/no-require-imports
  
  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'city-page-template.html')
    const template = fs.readFileSync(templatePath, 'utf8')
    
    // Replace all template variables
    return template
      .replace(/\{\{CITY_NAME\}\}/g, templateData.CITY_NAME)
      .replace(/\{\{STATE_NAME\}\}/g, templateData.STATE_NAME)
      .replace(/\{\{ZIP_CODE\}\}/g, templateData.ZIP_CODE)
      .replace(/\{\{POPULATION\}\}/g, templateData.POPULATION)
      .replace(/\{\{CITY_ESTABLISHED\}\}/g, templateData.CITY_ESTABLISHED)
      .replace(/\{\{COUNTY_NAME\}\}/g, templateData.COUNTY_NAME)
      .replace(/\{\{NEARBY_AREAS\}\}/g, templateData.NEARBY_AREAS)
      .replace(/\{\{NEARBY_CITIES\}\}/g, templateData.NEARBY_CITIES)
      .replace(/\{\{SITE_NAME\}\}/g, templateData.SITE_NAME)
      .replace(/\{\{NICHE\}\}/g, templateData.NICHE)
      .replace(/\{\{PHONE_NUMBER\}\}/g, templateData.PHONE_NUMBER)
      .replace(/\{\{YEARS_IN_BUSINESS\}\}/g, templateData.YEARS_IN_BUSINESS)
      .replace(/\{\{HERO_IMAGE\}\}/g, templateData.HERO_IMAGE)
  } catch (error) {
    console.error('Error reading template file:', error)
    // Fallback to the original template
    return `
      <div class="header">
        <div class="container">
          <h1>Professional ${templateData.NICHE} Services in ${templateData.CITY_NAME}</h1>
          <p class="subtitle">Serving ${templateData.CITY_NAME} with professional ${templateData.NICHE} services</p>
          <a href="tel:${templateData.PHONE_NUMBER}" class="cta-button">Call ${templateData.PHONE_NUMBER} Now</a>
        </div>
      </div>
      <div class="container">
        <div class="main-content">
          <h2>Professional ${templateData.NICHE} Services in ${templateData.CITY_NAME}</h2>
          <p>We provide comprehensive ${templateData.NICHE} services in ${templateData.CITY_NAME} and surrounding areas.</p>
        </div>
      </div>
    `
  }
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
