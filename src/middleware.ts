import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders, generateCSPNonce } from '@/lib/security/headers';
import { globalLimiter, checkRateLimit } from '@/lib/security/rate-limiter';
import { logEdgeRateLimitExceeded } from '@/lib/security/edge-logger';
import { headers } from 'next/headers';
import { auth } from './lib/auth/auth';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/my-space'];

/**
 * Vérifie si une route nécessite une authentification
 * @param pathname - Le chemin de la route
 * @returns true si la route est protégée, false sinon
 */
const isProtectedRoute = (pathname: string): boolean => {
  return protectedRoutes.some((route) => pathname.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { pathname } = request.nextUrl;

  // Vérifier le statut d'authentification de la route
  const isProtected = isProtectedRoute(pathname);

  // Redirection si route protégée sans session
  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL('/login?callbackUrl=' + encodeURIComponent(pathname), request.url),
    );
  }

  // Rediction for logged in users in login page
  if (session && pathname === '/login') {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    const callbackUrl = searchParams.get('callbackUrl');

    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  // Setup nonce pour la sécurité CSP
  const nonce = nanoid();
  const cspNonce = generateCSPNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp-nonce', cspNonce);

  // Créer la réponse avec headers sécurisés
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const searchParams = request.nextUrl.searchParams.toString();

  // Check for viewport cookie - prioritize it over User-Agent detection
  const viewportCookie = request.cookies.get('x-is-mobile');

  // Set mobile flag based on cookie or User-Agent as fallback
  let isMobile = false;

  if (viewportCookie) {
    // Use the cookie value if it exists
    isMobile = viewportCookie.value === 'true';
  }

  // Set headers
  response.headers.set('x-is-mobile', isMobile ? 'true' : 'false');
  response.headers.set(
    'x-current-path',
    request.nextUrl.pathname + (searchParams ? `?${searchParams}` : ''),
  );
  response.headers.set('x-params-string', request.nextUrl.searchParams.toString());

  const clientIP =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Vérification du rate limiting global par IP
  const rateLimitResult = await checkRateLimit(globalLimiter, clientIP);
  if (!rateLimitResult.allowed) {
    logEdgeRateLimitExceeded(clientIP, 'global', clientIP);
    return new NextResponse('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((rateLimitResult.msBeforeNext || 0) / 1000)),
      },
    });
  }

  // Appliquer les headers de sécurité
  return applySecurityHeaders(response, {
    'X-CSP-Nonce': cspNonce,
    'X-Client-IP': clientIP,
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
