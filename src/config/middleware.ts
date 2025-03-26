import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/config/auth'; // ✅ Updated path

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

// Define admin-only paths
const adminPaths = [
  '/admin',
  '/admin/keys',
  '/api/admin/keys',
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

  try {
    // ✅ Verify token & get user info
    const decoded = verifyToken(token) as { id: string; email: string; is_admin: number };

// ✅ Ensure only `is_admin === 1` can access admin paths
if (adminPaths.some(path => pathname.startsWith(path)) && decoded.is_admin !== 1) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}


    // ✅ Attach user info to API requests
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.id);
      requestHeaders.set('x-user-email', decoded.email);
      requestHeaders.set('x-user-admin', decoded.is_admin.toString());

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // ✅ Allow access to protected route
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware token verification error:', error);
    // ✅ Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
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
