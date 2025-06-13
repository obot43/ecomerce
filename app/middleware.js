// /middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get pathname and cookies
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token');
  const userRole = request.cookies.get('user_role')?.value;

  // Define protected routes by role
  const protectedRoutes = {
    admin: ['/admin', '/products/manage', '/settings'],
    user: ['/products', '/orders', '/profile'],
    public: ['/', '/login', '/register']
  };

  // Check if current path is protected
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = protectedRoutes.user.some(route => pathname.startsWith(route));

  // Redirect logic
  if (isAdminRoute) {
    // Protect admin routes
    if (!authToken || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isUserRoute) {
    // Protect user routes
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If user is already logged in, redirect from login/register pages
  if (authToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin' : '/products', request.url));
  }

  return NextResponse.next();
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
};