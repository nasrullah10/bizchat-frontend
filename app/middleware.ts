import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based route access map
const routeAccess: Record<string, string[]> = {
  '/dashboard/team': ['super_admin', 'business_owner', 'admin'],
  '/dashboard/settings': ['super_admin', 'business_owner'],
  '/dashboard/whatsapp': ['super_admin', 'business_owner', 'admin', 'manager'],
  '/dashboard/templates': ['super_admin', 'business_owner', 'admin', 'manager'],
  '/dashboard/broadcast': ['super_admin', 'business_owner', 'admin', 'manager'],
  '/dashboard/orders': ['super_admin', 'business_owner', 'admin', 'manager'],
  '/dashboard/products': ['super_admin', 'business_owner', 'admin', 'manager'],
  '/dashboard/customers': ['super_admin', 'business_owner', 'admin', 'manager', 'support'],
  '/dashboard/analytics': ['super_admin', 'business_owner', 'admin', 'manager', 'viewer'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Check if route needs role protection
  for (const [route, allowedRoles] of Object.entries(routeAccess)) {
    if (pathname.startsWith(route)) {
      // Get user role from cookie/localStorage (simplified)
      // In production, verify JWT token here
      const userCookie = request.cookies.get('user')
      
      if (!userCookie) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      try {
        const user = JSON.parse(userCookie.value)
        if (!allowedRoles.includes(user.role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}