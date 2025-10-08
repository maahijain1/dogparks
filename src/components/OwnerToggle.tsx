'use client'

import { useState, useEffect } from 'react'

// Simple component to toggle owner mode (for testing purposes)
export default function OwnerToggle() {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    // Check if owner mode is already set
    const ownerStatus = localStorage.getItem('owner_visit')
    setIsOwner(ownerStatus === 'true')
  }, [])

  const toggleOwnerMode = () => {
    const newStatus = !isOwner
    setIsOwner(newStatus)
    
    if (newStatus) {
      localStorage.setItem('owner_visit', 'true')
    } else {
      localStorage.removeItem('owner_visit')
    }
    
    // Reload page to apply changes
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleOwnerMode}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isOwner 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isOwner ? '🔒 Owner Mode (No Tracking)' : '🔓 Public Mode (Tracking Enabled)'}
      </button>
    </div>
  )
}
