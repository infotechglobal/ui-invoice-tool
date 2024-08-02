  import { NextResponse } from 'next/server'
  import { cookies } from 'next/headers'

  export function middleware(request) {
    const cookieStore = cookies()
    const token = cookieStore.get('token')
    if (!token) {
      console.warn('Token not found in cookies')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // console.log("next ", NextResponse);
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
