import { NextRequest, NextResponse } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/session',
  '/api/auth/logout',
];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Allow public routes
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Get token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // ✅ If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

}

// ✅ Middleware Configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
