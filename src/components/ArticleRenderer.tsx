'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface ArticleRendererProps {
  content: string
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  const [isChartLoaded, setIsChartLoaded] = useState(false)

  useEffect(() => {
    // Load external CSS and JS libraries when component mounts
    const loadExternalResources = () => {
      // Load Tailwind CSS
      if (!document.querySelector('link[href*="tailwindcss"]')) {
        const tailwindLink = document.createElement('link')
        tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
        tailwindLink.rel = 'stylesheet'
        document.head.appendChild(tailwindLink)
      }

      // Load Font Awesome
      if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesomeLink = document.createElement('link')
        fontAwesomeLink.href = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
        fontAwesomeLink.rel = 'stylesheet'
        document.head.appendChild(fontAwesomeLink)
      }

      // Load Google Fonts
      if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const googleFontsLink = document.createElement('link')
        googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        googleFontsLink.rel = 'stylesheet'
        document.head.appendChild(googleFontsLink)
      }

      // Load custom article content CSS
      if (!document.querySelector('link[href*="article-content.css"]')) {
        const customCSSLink = document.createElement('link')
        customCSSLink.href = '/styles/article-content.css'
        customCSSLink.rel = 'stylesheet'
        document.head.appendChild(customCSSLink)
      }
    }

    loadExternalResources()
  }, [])

  useEffect(() => {
    // Re-run scripts embedded in the HTML content after Chart.js loads
    if (isChartLoaded && content) {
      const timer = setTimeout(() => {
        const container = document.getElementById('article-content-container')
        if (container) {
          // Find and re-execute all script tags in the content
          const scripts = container.querySelectorAll('script')
          scripts.forEach(oldScript => {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value)
            })
            newScript.appendChild(document.createTextNode(oldScript.innerHTML))
            oldScript.parentNode?.replaceChild(newScript, oldScript)
          })
        }
      }, 500) // Wait for Chart.js to be fully available
      
      return () => clearTimeout(timer)
    }
  }, [content, isChartLoaded])

  return (
    <>
      {/* Chart.js Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && typeof window.Chart !== 'undefined') {
            setIsChartLoaded(true)
            console.log('Chart.js loaded successfully')
          }
        }}
      />
      
      {/* Render the HTML content with proper styling */}
      <div 
        id="article-content-container"
        className="article-content-container prose prose-lg max-w-none"
        style={{
          fontFamily: "'Inter', sans-serif",
          lineHeight: '1.6'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  )
}
