import { supabase } from './supabase'

// Cache for settings to avoid repeated database calls
let settingsCache: Record<string, string> | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getSiteSettings(): Promise<Record<string, string>> {
  // Return cached settings if still valid
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return settingsCache
  }

  try {
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')

    if (error) {
      console.error('Error fetching settings:', error)
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
    console.error('Error in getSiteSettings:', error)
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
  return template
    .replace('{site_name}', settings.site_name || 'DirectoryHub')
    .replace('{niche}', settings.niche || 'Dog Park')
    .replace('{country}', settings.country || 'USA')
    .replace('{niche_lower}', (settings.niche || 'Dog Park').toLowerCase())
}
