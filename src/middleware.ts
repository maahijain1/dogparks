import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle {niche}-{city} URLs - redirect to /city/{city}
  // This catches patterns like boarding-kennels-albury, boarding-kennels-newcastle, etc.
  if (pathname.startsWith('/boarding-kennels-')) {
    const parts = pathname.split('/')
    const slug = parts[1] // Get the part after the first slash
    
    // Remove the niche prefix
    const citySlug = slug.replace(/^boarding-kennels-/, '')
    
    // Redirect to the city page
    return NextResponse.redirect(new URL(`/city/${citySlug}`, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
