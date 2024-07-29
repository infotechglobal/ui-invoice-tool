import { NextResponse } from 'next/server'


export function middleware(request) {
  const path = request.nextUrl.pathname

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value
  console.log("token", token);

  if (!token) {
    console.warn('Token not found in cookies')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
 
    
    return NextResponse.next()
  } catch (error) {
    // If verification fails, redirect to login
    console.error('Token verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*'],
}
