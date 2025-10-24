import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  // Check if this is an about-* article
  if (slug && slug.startsWith('about-')) {
    // Redirect to homepage with a message
    return NextResponse.redirect(new URL('/', request.url), 301)
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
