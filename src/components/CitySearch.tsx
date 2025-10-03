'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface CitySearchProps {
  cities: Array<{ id: string; name: string }>
}

export default function CitySearch({ cities }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    const cityCards = document.querySelectorAll('[data-city-name]')
    cityCards.forEach(card => {
      const cityName = card.getAttribute('data-city-name')?.toLowerCase() || ''
      const shouldShow = cityName.includes(searchTerm.toLowerCase())
      ;(card as HTMLElement).style.display = shouldShow ? 'block' : 'none'
    })
  }, [searchTerm])

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search cities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      {searchTerm && (
        <p className="text-center text-sm text-gray-500 mt-2">
          Showing {filteredCities.length} of {cities.length} cities
        </p>
      )}
    </div>
  )
}
