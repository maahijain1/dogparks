'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface ArticleRendererProps {
  content: string
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  const [isChartLoaded, setIsChartLoaded] = useState(false)
  const [isContentRendered, setIsContentRendered] = useState(false)

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
    // Mark content as rendered
    setIsContentRendered(true)
  }, [content])

  useEffect(() => {
    // Re-run scripts embedded in the HTML content after Chart.js loads
    if (isChartLoaded && isContentRendered && content) {
      const timer = setTimeout(() => {
        const container = document.getElementById('article-content-container')
        if (container) {
          console.log('Processing embedded scripts...')
          
          // Find and re-execute all script tags in the content
          const scripts = container.querySelectorAll('script')
          console.log(`Found ${scripts.length} scripts to process`)
          
          scripts.forEach((oldScript, index) => {
            try {
              const newScript = document.createElement('script')
              
              // Copy all attributes
              Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value)
              })
              
              // Copy script content
              newScript.appendChild(document.createTextNode(oldScript.innerHTML))
              
              // Replace the old script
              oldScript.parentNode?.replaceChild(newScript, oldScript)
              
              console.log(`Processed script ${index + 1}`)
            } catch (error) {
              console.error(`Error processing script ${index + 1}:`, error)
            }
          })
          
          // Also try to initialize any charts that might be in the content
          const canvases = container.querySelectorAll('canvas')
          console.log(`Found ${canvases.length} canvas elements`)
          
          canvases.forEach((canvas, index) => {
            if (canvas.id && typeof window !== 'undefined' && window.Chart) {
              console.log(`Processing canvas ${index + 1}: ${canvas.id}`)
              // Let the embedded scripts handle chart initialization
            }
          })
        }
      }, 1000) // Increased timeout to ensure everything is ready
      
      return () => clearTimeout(timer)
    }
  }, [content, isChartLoaded, isContentRendered])

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
