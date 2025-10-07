import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Directory Admin Panel',
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
}

// Force no caching for admin pages
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}