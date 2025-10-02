// Cache busting utilities for admin pages

export function addCacheBuster() {
  // Add a timestamp to force browser to reload
  if (typeof window !== 'undefined') {
    const timestamp = Date.now()
    const url = new URL(window.location.href)
    url.searchParams.set('_t', timestamp.toString())
    
    // Only update if the timestamp is different
    if (url.searchParams.get('_t') !== timestamp.toString()) {
      window.history.replaceState({}, '', url.toString())
    }
  }
}

export function clearCache() {
  // Clear browser cache for admin pages
  if (typeof window !== 'undefined') {
    // Force reload from server
    window.location.reload()
  }
}

export function disableCache() {
  // Add meta tags to disable caching
  if (typeof document !== 'undefined') {
    const meta1 = document.createElement('meta')
    meta1.httpEquiv = 'Cache-Control'
    meta1.content = 'no-cache, no-store, must-revalidate'
    
    const meta2 = document.createElement('meta')
    meta2.httpEquiv = 'Pragma'
    meta2.content = 'no-cache'
    
    const meta3 = document.createElement('meta')
    meta3.httpEquiv = 'Expires'
    meta3.content = '0'
    
    document.head.appendChild(meta1)
    document.head.appendChild(meta2)
    document.head.appendChild(meta3)
  }
}
