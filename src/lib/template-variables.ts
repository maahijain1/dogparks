// Template variable system for city-specific content generation

export interface TemplateVariables {
  cityName: string
  stateName: string
  cityId: string
  stateId: string
  businessCount: number
  featuredCount: number
  averageRating: number
  topCategory: string
  population: number
  establishedYear: string
  localLandmark: string
  nearbyCities: string[]
  weatherInfo: string
  localEvents: string[]
  transportation: string
  parkingInfo: string
  accessibility: string
  petFriendly: string
  localTips: string[]
  contactInfo: string
}

export const getTemplateVariables = async (cityId: string): Promise<TemplateVariables> => {
  // This would fetch real data from your database
  // For now, returning mock data structure
  return {
    cityName: '{{CITY_NAME}}',
    stateName: '{{STATE_NAME}}',
    cityId: cityId,
    stateId: '{{STATE_ID}}',
    businessCount: 0,
    featuredCount: 0,
    averageRating: 0,
    topCategory: '{{TOP_CATEGORY}}',
    population: 0,
    establishedYear: '{{ESTABLISHED_YEAR}}',
    localLandmark: '{{LOCAL_LANDMARK}}',
    nearbyCities: ['{{NEARBY_CITY_1}}', '{{NEARBY_CITY_2}}'],
    weatherInfo: '{{WEATHER_INFO}}',
    localEvents: ['{{EVENT_1}}', '{{EVENT_2}}'],
    transportation: '{{TRANSPORTATION}}',
    parkingInfo: '{{PARKING_INFO}}',
    accessibility: '{{ACCESSIBILITY}}',
    petFriendly: '{{PET_FRIENDLY}}',
    localTips: ['{{TIP_1}}', '{{TIP_2}}'],
    contactInfo: '{{CONTACT_INFO}}'
  }
}

export const replaceTemplateVariables = (content: string, variables: TemplateVariables): string => {
  let processedContent = content
  
  // Replace all template variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key.toUpperCase()}}}`
    if (Array.isArray(value)) {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value.join(', '))
    } else {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value))
    }
  })
  
  return processedContent
}

export const getAvailableVariables = (): string[] => {
  return [
    '{{CITY_NAME}}',
    '{{STATE_NAME}}',
    '{{CITY_ID}}',
    '{{STATE_ID}}',
    '{{BUSINESS_COUNT}}',
    '{{FEATURED_COUNT}}',
    '{{AVERAGE_RATING}}',
    '{{TOP_CATEGORY}}',
    '{{POPULATION}}',
    '{{ESTABLISHED_YEAR}}',
    '{{LOCAL_LANDMARK}}',
    '{{NEARBY_CITIES}}',
    '{{WEATHER_INFO}}',
    '{{LOCAL_EVENTS}}',
    '{{TRANSPORTATION}}',
    '{{PARKING_INFO}}',
    '{{ACCESSIBILITY}}',
    '{{PET_FRIENDLY}}',
    '{{LOCAL_TIPS}}',
    '{{CONTACT_INFO}}'
  ]
}
