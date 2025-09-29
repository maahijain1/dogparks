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
        '/api/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}


