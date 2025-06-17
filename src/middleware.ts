import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateCSPNonce } from '@/lib/security/headers';
//import { globalLimiter, checkRateLimit } from '@/lib/security/rate-limiter';
//import { logEdgeRateLimitExceeded } from '@/lib/security/edge-logger';
import { getSessionCookie } from 'better-auth/cookies';

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/my-space'] as const;

/**
 * Vérifie si une route nécessite une authentification
 * @param pathname - Le chemin de la route
 * @returns true si la route est protégée, false sinon
 */
const isProtectedRoute = (pathname: string): boolean => {
  return protectedRoutes.some((route) => pathname.startsWith(route));
};

/**
 * Extrait l'adresse IP du client depuis les headers de la requête
 * @param request - La requête Next.js
 * @returns L'adresse IP du client ou 'unknown'
 */
const getClientIP = (request: NextRequest): string => {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  );
};

/**
 * Gère les redirections d'authentification
 * @param request - La requête Next.js
 * @param session - La session utilisateur
 * @param pathname - Le chemin de la route
 * @returns NextResponse de redirection ou null
 */
const handleAuthRedirects = (
  request: NextRequest,
  session: string | null,
  pathname: string,
): NextResponse | null => {
  const isProtected = isProtectedRoute(pathname);

  console.log('isProtected', isProtected);

  // Redirection si route protégée sans session
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirection pour les utilisateurs connectés sur la page de login
  if (session && pathname === '/login') {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl
      ? new URL(callbackUrl, request.url)
      : new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return null;
};

/**
 * Configure les headers de sécurité et de contexte
 * @param request - La requête Next.js
 * @param response - La réponse Next.js
 * @param nonce - Le nonce généré
 * @param cspNonce - Le nonce CSP
 * @param clientIP - L'adresse IP du client
 */
const configureHeaders = (
  request: NextRequest,
  response: NextResponse,
  nonce: string,
  cspNonce: string,
  clientIP: string,
): void => {
  const searchParams = request.nextUrl.searchParams.toString();

  // Headers de contexte
  response.headers.set(
    'x-current-path',
    request.nextUrl.pathname + (searchParams ? `?${searchParams}` : ''),
  );
  response.headers.set('x-params-string', searchParams);

  // Gestion du viewport mobile via cookie
  const viewportCookie = request.cookies.get('x-is-mobile');
  const isMobile = viewportCookie?.value === 'true';
  response.headers.set('x-is-mobile', isMobile ? 'true' : 'false');

  // Headers de sécurité
  response.headers.set('x-nonce', nonce);
  response.headers.set('x-csp-nonce', cspNonce);
  response.headers.set('x-client-ip', clientIP);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Vérification de la session utilisateur
  const session = getSessionCookie(request);

  // Gestion des redirections d'authentification
  const authRedirect = handleAuthRedirects(request, session, pathname);
  if (authRedirect) {
    return authRedirect;
  }

  // Génération des nonces de sécurité
  const nonce = nanoid();
  const cspNonce = generateCSPNonce();

  // Configuration des headers de requête
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-csp-nonce', cspNonce);

  // Création de la réponse avec headers modifiés
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Configuration des headers de réponse
  configureHeaders(request, response, nonce, cspNonce, clientIP);

  // Application des headers de sécurité
  // TODO: Uncomment this when we have a proper CSP policy
  /**return applySecurityHeaders(response, {
    'X-CSP-Nonce': cspNonce,
    'X-Client-IP': clientIP,
  });*/
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
