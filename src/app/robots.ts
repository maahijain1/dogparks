import { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/dynamic-config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Get dynamic site URL from settings
  const settings = await getSiteSettings()
  const baseUrl = settings.site_url || 'https://directoryhub.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/admin/*',
        '/api/',
        '/_next/',
        '/static/',
        '/debug-*',
        '/test-*',
        '/fix-*',
        '/setup-*',
        '/emergency-*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


