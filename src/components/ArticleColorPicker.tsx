'use client'

import { useState, useEffect } from 'react'

interface ArticleColorPickerProps {
  onColorChange?: (colors: ArticleColors) => void
}

interface ArticleColors {
  primary: string
  primaryHover: string
  text: string
  heading: string
}

const defaultColors: ArticleColors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  text: '#374151',
  heading: '#1f2937'
}

export default function ArticleColorPicker({ onColorChange }: ArticleColorPickerProps) {
  const [colors, setColors] = useState<ArticleColors>(defaultColors)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved colors from localStorage
    const savedColors = localStorage.getItem('article-colors')
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors)
        setColors(parsed)
        applyColors(parsed)
      } catch (error) {
        console.error('Error loading saved colors:', error)
      }
    }
  }, [])

  const applyColors = (newColors: ArticleColors) => {
    const root = document.documentElement
    root.style.setProperty('--article-primary-color', newColors.primary)
    root.style.setProperty('--article-primary-hover', newColors.primaryHover)
    root.style.setProperty('--article-text-color', newColors.text)
    root.style.setProperty('--article-heading-color', newColors.heading)
    root.style.setProperty('--article-link-color', newColors.primary)
    root.style.setProperty('--article-link-hover', newColors.primaryHover)
  }

  const handleColorChange = (key: keyof ArticleColors, value: string) => {
    const newColors = { ...colors, [key]: value }
    setColors(newColors)
    applyColors(newColors)
    
    // Save to localStorage
    localStorage.setItem('article-colors', JSON.stringify(newColors))
    
    // Notify parent component
    if (onColorChange) {
      onColorChange(newColors)
    }
  }

  const resetToDefault = () => {
    setColors(defaultColors)
    applyColors(defaultColors)
    localStorage.setItem('article-colors', JSON.stringify(defaultColors))
    if (onColorChange) {
      onColorChange(defaultColors)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div 
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: colors.primary }}
        />
        <span className="text-sm font-medium text-gray-700">Article Colors</span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Article Color Settings</h3>
              <button
                onClick={resetToDefault}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to Default
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color (Links)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Hover Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.primaryHover}
                    onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.primaryHover}
                    onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#1d4ed8"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#374151"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={colors.heading}
                    onChange={(e) => handleColorChange('heading', e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors.heading}
                    onChange={(e) => handleColorChange('heading', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#1f2937"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Changes are saved automatically and apply to all articles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
