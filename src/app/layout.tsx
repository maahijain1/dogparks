import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'
import { getSiteSettings, generateDynamicContent } from '@/lib/dynamic-config'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  // Get dynamic settings (force refresh for meta tags)
  const settings = await getSiteSettings(true)
  
  // Generate dynamic content
  const dynamicTitle = generateDynamicContent(siteConfig.seo.homepage.title, {
    niche: settings.niche || 'Dog Park',
    country: settings.country || 'USA'
  })
  
  const dynamicDescription = generateDynamicContent(siteConfig.seo.homepage.description, {
    niche: settings.niche || 'Dog Park',
    country: settings.country || 'USA'
  })
  
  const dynamicKeywords = generateDynamicContent(siteConfig.seo.homepage.keywords, {
    niche: settings.niche || 'Dog Park',
    country: settings.country || 'USA'
  })

  return {
    title: {
      default: dynamicTitle,
      template: `%s | ${settings.site_name || 'DirectoryHub'}`
    },
    description: dynamicDescription,
    keywords: dynamicKeywords,
    authors: [{ name: 'DirectoryHub Team' }],
    creator: settings.site_name || 'DirectoryHub',
    publisher: settings.site_name || 'DirectoryHub',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      url: siteConfig.siteUrl,
      siteName: settings.site_name || 'DirectoryHub',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.business.social.twitter,
      creator: siteConfig.business.social.twitter,
      title: dynamicTitle,
      description: dynamicDescription,
    },
    alternates: {
      canonical: siteConfig.siteUrl,
    },
    verification: {
      google: 'your-google-verification-code', // Add your Google Search Console verification code
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}