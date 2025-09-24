'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminAuthProps {
  children: React.ReactNode
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      // If we're on the login page, don't redirect
      if (pathname === '/admin/login') {
        setLoading(false)
        return
      }

      const authenticated = localStorage.getItem('adminAuthenticated')
      const adminUser = localStorage.getItem('adminUser')
      
      if (authenticated === 'true' && adminUser) {
        setIsAuthenticated(true)
      } else {
        // Redirect to login
        router.push('/admin/login')
      }
      setLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If we're on the login page, always render children
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // If not authenticated, don't render children (will redirect to login)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render the admin content
  return <>{children}</>
}
