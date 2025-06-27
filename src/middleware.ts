import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './schemas/routes';
import { getSessionCookie } from 'better-auth/cookies';

// Define route patterns more comprehensively
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/registration', 
  '/feedback',
  '/help',
  '/legal',
  '/privacy-policy',
  '/terms',
  '/api/auth/callback',
  '/api/uploadthing',
] as const;

const PROTECTED_ROUTE_PATTERNS = [
  '/dashboard',
  '/my-space',
  '/api/protected',
] as const;

/**
 * Check if a route is public (doesn't require authentication)
 */
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
};

/**
 * Check if a route is protected (requires authentication)
 */
const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTE_PATTERNS.some(pattern => 
    pathname.startsWith(pattern)
  );
};

/**
 * Validate and clean callback URL to prevent open redirects
 */
const sanitizeCallbackUrl = (url: string): string => {
  try {
    // Only allow relative URLs that start with /
    if (url.startsWith('/') && !url.startsWith('//') && !url.includes('javascript:')) {
      return url;
    }
  } catch {
    // Invalid URL, ignore
  }
  return '/';
};

/**
 * Handle authentication redirects with proper session validation
 */
const handleAuthRedirects = async (
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null> => {
  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return null;
  }

  try {
    // Get session cookie using better-auth's edge-compatible method
    const sessionToken = getSessionCookie(request);
    const hasValidSession = !!sessionToken;

    // Redirect to login if accessing protected route without valid session
    if (isProtectedRoute(pathname) && !hasValidSession) {
      const loginUrl = new URL(ROUTES.auth.login, request.url);      
      
      // Add callback URL if it's a valid route
      const callbackUrl = sanitizeCallbackUrl(pathname);
      if (callbackUrl !== '/') {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/login') && hasValidSession) {
      // Get callback URL from search params
      const { searchParams } = request.nextUrl;
      const callbackUrl = searchParams.get('callbackUrl');
      
      if (callbackUrl) {
        const sanitized = sanitizeCallbackUrl(callbackUrl);
        return NextResponse.redirect(new URL(sanitized, request.url));
      }

      // Default redirect to dashboard (role-based redirect will be handled by the login page)
      return NextResponse.redirect(new URL(ROUTES.dashboard.base, request.url));
    }

  } catch (error) {
    console.error('Middleware auth check failed:', error);
    
    // On auth error, redirect protected routes to login
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL(ROUTES.auth.login, request.url));
    }
  }

  return null;
};



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle authentication redirects first
  const authRedirect = await handleAuthRedirects(request, pathname);
  if (authRedirect) {
    return authRedirect;
  }

  // Continue with your existing security headers logic
  const response = NextResponse.next();
  
  // Add security headers
  const searchParams = request.nextUrl.searchParams.toString();
  response.headers.set(
    'x-current-path',
    pathname + (searchParams ? `?${searchParams}` : ''),
  );
  response.headers.set('x-params-string', searchParams);

}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
