/**
 * NextAuth v5 Middleware for Route Protection
 * Protects authenticated routes and handles redirects
 */

import { auth } from '@/server/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard');
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isProtectedApiRoute = nextUrl.pathname.startsWith('/api') && !isApiAuthRoute;

  // Redirect logged in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Protect dashboard routes
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // Protect API routes (except auth routes)
  if (isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all dashboard routes
    '/dashboard/:path*',
    
    // Protect API routes (except auth)
    '/api/((?!auth).*)',
    
    // Handle auth page redirects
    '/auth/:path*',
  ],
};