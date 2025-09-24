'use client'

import Link from 'next/link'
import { LogOut, User, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  title?: string
  showBackButton?: boolean
  backUrl?: string
}

export default function AdminHeader({ 
  title = "Admin Panel", 
  showBackButton = false, 
  backUrl = "/admin" 
}: AdminHeaderProps) {
  const [adminUser, setAdminUser] = useState('')
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('adminUser')
    if (user) {
      setAdminUser(user)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {showBackButton && (
              <Link 
                href={backUrl}
                className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <Link href="/admin" className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <User className="h-4 w-4 mr-2" />
              {adminUser}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



