import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.homepage.title,
    template: `%s | ${siteConfig.siteName}`
  },
  description: siteConfig.seo.homepage.description,
  keywords: siteConfig.seo.homepage.keywords,
  authors: [{ name: 'DirectoryHub Team' }],
  creator: 'DirectoryHub',
  publisher: 'DirectoryHub',
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
    title: siteConfig.seo.homepage.title,
    description: siteConfig.seo.homepage.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.siteName,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.business.social.twitter,
    creator: siteConfig.business.social.twitter,
    title: siteConfig.seo.homepage.title,
    description: siteConfig.seo.homepage.description,
  },
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
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