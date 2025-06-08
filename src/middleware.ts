import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { auth } from '@/next-auth';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders, generateCSPNonce } from '@/lib/security/headers';
import { globalLimiter, checkRateLimit } from '@/lib/security/rate-limiter';
import {
  logEdgeUnauthorizedAccess,
  logEdgeRateLimitExceeded,
} from '@/lib/security/edge-logger';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/registration',
  '/feedback',
  '/legal',
  '/api/auth',
  '/',
];

// Routes API publiques
const publicApiRoutes = ['/api/auth', '/api/uploadthing'];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const clientIP =
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

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

  // Setup nonce pour la sécurité CSP
  const nonce = nanoid();
  const cspNonce = generateCSPNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp-nonce', cspNonce);

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));

  // Si ce n'est pas une route publique et que l'utilisateur n'est pas authentifié
  if (!isPublicRoute && !isPublicApiRoute && !req.auth) {
    logEdgeUnauthorizedAccess(
      pathname,
      clientIP,
      req.headers.get('user-agent') || 'unknown',
    );
    const newUrl = new URL('/auth/login', req.nextUrl.origin);
    newUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(newUrl);
  }

  // Créer la réponse avec headers sécurisés
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Appliquer les headers de sécurité
  return applySecurityHeaders(response, {
    'X-CSP-Nonce': cspNonce,
    'X-Client-IP': clientIP,
  });
});

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
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

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
