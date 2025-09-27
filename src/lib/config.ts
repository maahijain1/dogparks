// Centralized configuration for DirectoryHub
// Change the niche here and it will update everywhere

export const siteConfig = {
  // Main niche - change this to update everywhere
  niche: 'Dog Park',
  
  // Country/Region
  country: 'USA',
  
  // Site information
  siteName: 'DirectoryHub',
  siteDescription: 'Find the best local dog parks in your area',
  siteUrl: 'https://dogparks.vercel.app',
  
  // SEO templates
  seo: {
    // Homepage
    homepage: {
      title: 'Find the Best Local {niche}s Near You',
      description: 'Discover top-rated {niche}s in your area. Find the perfect place for your furry friend to play, exercise, and socialize.',
      keywords: '{niche}s, local {niche}s, {niche} directory, {niche} finder, {niche} areas, pet-friendly {niche}s'
    },
    
    // State pages
    state: {
      title: '{stateName} {niche} Directory | Find {niche}s in {stateName}',
      description: 'Discover {totalListings} {niche}s across {totalCities} cities in {stateName}. Find the perfect {niche} for your furry friend.',
      keywords: '{stateName} {niche}s, {niche}s in {stateName}, {stateName} {niche} directory, local {niche}s {stateName}'
    },
    
    // City pages
    city: {
      title: '{cityName} {niche} Directory | Find {niche}s in {cityName}, {stateName}',
      description: 'Find {totalListings} {niche}s in {cityName}, {stateName}. Discover the best places for your dog to play and exercise.',
      keywords: '{cityName} {niche}s, {niche}s in {cityName}, {cityName} {niche} directory, local {niche}s {cityName} {stateName}'
    },
    
    // Article pages
    article: {
      title: '{articleTitle} | {niche} Directory',
      description: 'Learn about {niche}s and pet care. Expert tips and information for dog owners.',
      keywords: '{niche}s, pet care, dog exercise, {niche} tips, pet-friendly areas'
    }
  },
  
  // Content templates
  content: {
    // Hero section
    hero: {
      title: 'Find the Best Local {niche}s',
      subtitle: 'Discover top-rated {niche}s in {country}',
      searchPlaceholder: 'Search {niche}s, locations...',
      searchButton: 'Search'
    },
    
    // Featured section
    featured: {
      title: 'Featured Dog Parks',
      subtitle: 'Hand-picked premium dog parks that stand out from the crowd',
      badge: '⭐ FEATURED DOG PARK'
    },
    
    // Listings section
    listings: {
      title: 'All Dog Parks',
      subtitle: 'Complete directory of dog parks in your area',
      noResults: 'No dog parks found matching your search',
      searchResults: 'Found {count} dog parks for "{query}"'
    },
    
    // Categories
    categories: {
      title: 'Dog Park Categories',
      subtitle: 'Browse dog parks by type and amenities'
    },
    
    // Navigation
    navigation: {
      home: 'Home',
      about: 'About',
      privacy: 'Privacy Policy',
      contact: 'Contact',
      admin: 'Admin'
    },
    
    // Footer
    footer: {
      description: 'Your trusted directory for finding the best dog parks in your area. Connect with local pet communities and discover new places for your furry friend to play.',
      quickLinks: 'Quick Links',
      contactInfo: 'Contact Info',
      copyright: '© 2024 DirectoryHub. All rights reserved.'
    }
  },
  
  // Business information
  business: {
    name: 'DirectoryHub',
    email: 'info@directoryhub.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St\nCity, State 12345',
    social: {
      twitter: '@DirectoryHub',
      facebook: 'DirectoryHub',
      instagram: '@DirectoryHub'
    }
  },
  
  // Technical settings
  technical: {
    itemsPerPage: 12,
    featuredLimit: 6,
    searchDebounce: 300,
    geolocationTimeout: 10000
  }
}

// Helper functions to generate dynamic content
export const generateSEOTitle = (template: string, replacements: Record<string, string>): string => {
  let result = template
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  return result
}

export const generateSEODescription = (template: string, replacements: Record<string, string>): string => {
  let result = template
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  return result
}

export const generateSEOKeywords = (template: string, replacements: Record<string, string>): string => {
  let result = template
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  return result
}

// Export individual sections for easy access
export const { niche, seo, content, business, technical } = siteConfig

