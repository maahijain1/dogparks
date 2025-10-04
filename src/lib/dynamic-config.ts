import { supabase } from './supabase'

// Cache for settings to avoid repeated database calls
let settingsCache: Record<string, string> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 30 * 1000 // 30 seconds (reduced for faster updates)

export async function getSiteSettings(forceRefresh = false): Promise<Record<string, string>> {
  // Return cached settings if still valid and not forcing refresh
  if (!forceRefresh && settingsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return settingsCache
  }

  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')

    if (error) {
      // Return default values if database fails
      return {
        site_name: 'DirectoryHub',
        niche: 'Dog Park',
        country: 'USA'
      }
    }

    // Convert array to object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    // Cache the settings
    settingsCache = settingsObj
    cacheTimestamp = Date.now()

    return settingsObj
  } catch (error) {
    // Return default values if there's an error
    return {
      site_name: 'DirectoryHub',
      niche: 'Dog Park',
      country: 'USA'
    }
  }
}

// Function to clear cache (useful after updates)
export function clearSettingsCache() {
  settingsCache = null
  cacheTimestamp = 0
}

// Helper function to generate dynamic content
export function generateDynamicContent(template: string, settings: Record<string, string>): string {
  const niche = settings.niche || 'Dog Park'
  const nicheLower = niche.toLowerCase()
  
  // Smart pluralization - only add 's' if niche doesn't already end with 's'
  const nichePlural = niche.endsWith('s') ? niche : niche + 's'
  const nicheLowerPlural = nicheLower.endsWith('s') ? nicheLower : nicheLower + 's'
  
  return template
    .replace('{site_name}', settings.site_name || 'DirectoryHub')
    .replace('{niche}', niche)
    .replace('{niche_plural}', nichePlural)
    .replace('{niche_lower}', nicheLower)
    .replace('{niche_lower_plural}', nicheLowerPlural)
    .replace('{country}', settings.country || 'USA')
}
