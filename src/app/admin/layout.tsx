import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Directory Admin Panel',
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