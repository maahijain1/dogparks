'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface ArticleRendererProps {
  content: string
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  const [isChartLoaded, setIsChartLoaded] = useState(false)
  const [isFontAwesomeLoaded, setIsFontAwesomeLoaded] = useState(false)

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
        fontAwesomeLink.onload = () => setIsFontAwesomeLoaded(true)
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
    // Re-run scripts embedded in the HTML content after it's rendered
    // This is important for Chart.js or any other dynamic scripts
    const container = document.getElementById('article-content-container')
    if (container && isChartLoaded) {
      // Wait a bit for the DOM to be ready
      setTimeout(() => {
        const scripts = container.querySelectorAll('script')
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script')
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value))
          newScript.appendChild(document.createTextNode(oldScript.innerHTML))
          oldScript.parentNode?.replaceChild(newScript, oldScript)
        })
      }, 100)
    }
  }, [content, isChartLoaded])

  // Additional effect to ensure charts render after content changes
  useEffect(() => {
    if (isChartLoaded && content) {
      const timer = setTimeout(() => {
        console.log('Attempting to initialize charts...')
        const container = document.getElementById('article-content-container')
        if (container) {
          // Look for canvas elements and try to initialize charts
          const canvases = container.querySelectorAll('canvas')
          console.log('Found canvases:', canvases.length)
          
          // Initialize specific charts from your HTML
          canvases.forEach((canvas, index) => {
            console.log(`Canvas ${index}:`, canvas.id, canvas)
            if (canvas.id && typeof window !== 'undefined' && window.Chart) {
              // Check if chart already exists
              const existingChart = (window as any).Chart.getChart(canvas)
              if (!existingChart) {
                console.log(`Initializing chart for canvas: ${canvas.id}`)
                
                // Initialize specific charts based on their IDs
                try {
                  if (canvas.id === 'anxietyStatsChart') {
                    new (window as any).Chart(canvas, {
                      type: 'doughnut',
                      data: {
                        labels: ['Separation Anxiety Concern', 'Other Behavioral Concerns', 'No Major Concerns'],
                        datasets: [{
                          data: [61, 19, 20],
                          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
                          borderWidth: 0
                        }]
                      },
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Pet Owner Behavioral Concerns (2025 Survey)',
                            font: { size: 16, weight: 'bold' }
                          },
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }
                    })
                  } else if (canvas.id === 'preparationTimelineChart') {
                    new (window as any).Chart(canvas, {
                      type: 'bar',
                      data: {
                        labels: ['Week 1 (Days 21-14)', 'Week 2 (Days 14-7)', 'Week 3 (Days 7-0)'],
                        datasets: [{
                          label: 'Stress Reduction Impact (%)',
                          data: [25, 35, 40],
                          backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6'],
                          borderWidth: 0
                        }]
                      },
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Cumulative Stress Reduction by Preparation Week',
                            font: { size: 16, weight: 'bold' }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 50,
                            title: {
                              display: true,
                              text: 'Stress Reduction (%)'
                            }
                          }
                        }
                      }
                    })
                  } else if (canvas.id === 'facilityEvaluationChart') {
                    new (window as any).Chart(canvas, {
                      type: 'radar',
                      data: {
                        labels: ['Staff-to-Dog Ratio', 'Facility Design', 'Emergency Protocols', 'Socialization Approach', 'Communication', 'Enrichment Activities'],
                        datasets: [{
                          label: 'Importance Weight (%)',
                          data: [25, 20, 25, 15, 10, 5],
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          borderColor: '#3B82F6',
                          pointBackgroundColor: '#3B82F6',
                          borderWidth: 2
                        }]
                      },
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Facility Evaluation Criteria Importance',
                            font: { size: 16, weight: 'bold' }
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 30
                          }
                        }
                      }
                    })
                  } else if (canvas.id === 'medicalNeedsChart') {
                    new (window as any).Chart(canvas, {
                      type: 'bar',
                      data: {
                        labels: ['Diabetes', 'Arthritis', 'Cardiac Conditions', 'Kidney Disease', 'Seizure Disorders'],
                        datasets: [{
                          label: 'Success Rate (%)',
                          data: [92, 88, 85, 82, 78],
                          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
                          borderWidth: 0
                        }]
                      },
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Boarding Success Rates by Medical Condition',
                            font: { size: 16, weight: 'bold' }
                          }
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Success Rate (%)'
                            }
                          }
                        }
                      }
                    })
                  } else if (canvas.id === 'successRatesChart') {
                    new (window as any).Chart(canvas, {
                      type: 'bar',
                      data: {
                        labels: ['Comprehensive Preparation', 'Standard Preparation', 'Minimal Preparation', 'No Preparation'],
                        datasets: [{
                          label: 'Success Rate (%)',
                          data: [92, 78, 67, 45],
                          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
                          borderWidth: 0
                        }, {
                          label: 'Complication Rate (%)',
                          data: [3, 8, 15, 28],
                          backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(245, 158, 11, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(220, 38, 38, 0.8)'],
                          borderWidth: 0
                        }]
                      },
                      options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Boarding Outcomes by Preparation Level',
                            font: { size: 16, weight: 'bold' }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Percentage (%)'
                            }
                          }
                        }
                      }
                    })
                  }
                } catch (error) {
                  console.log('Chart initialization error for', canvas.id, ':', error)
                }
              } else {
                console.log(`Chart already exists for canvas: ${canvas.id}`)
              }
            }
          })
        }
      }, 1000) // Increased timeout to ensure everything is loaded
      
      return () => clearTimeout(timer)
    }
  }, [content, isChartLoaded])

  return (
    <>
      {/* Chart.js Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="beforeInteractive"
        onLoad={() => {
          // Initialize charts after Chart.js loads
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
