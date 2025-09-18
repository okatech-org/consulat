import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './schemas/routes';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/registration',
  '/registration/sync',
  'feedback',
  'legal(.*)',
  'unauthorized',
  'listing(.*)',
  '/',
]);

function getBaseUrlByRole(roles: UserRole[]) {
  if (roles.includes(UserRole.USER)) {
    return ROUTES.user.base;
  }

  if (
    roles.some((role) =>
      [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.AGENT,
        UserRole.EDUCATION_AGENT,
      ].includes(role),
    )
  ) {
    return ROUTES.dashboard.base;
  }

  if (roles.includes(UserRole.INTEL_AGENT)) {
    return ROUTES.intel.base;
  }

  return ROUTES.base;
}

// Fonction pour gérer les fonctionnalités personnalisées existantes
function handleCustomFeatures(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  const searchParams = request.nextUrl.searchParams.toString();

  // Préserver le header x-current-path existant
  response.headers.set(
    'x-current-path',
    pathname + (searchParams ? `?${searchParams}` : ''),
  );

  // Gestion du thème pour éviter l'hydratation mismatch
  const theme = request.cookies.get('theme')?.value;
  if (theme && ['light', 'dark', 'system'].includes(theme)) {
    response.headers.set('X-Theme', theme);
    // Assurer que le cookie est bien configuré
    response.cookies.set('theme', theme, {
      path: '/',
      maxAge: 31536000, // 1 an
      secure: true,
      sameSite: 'lax',
    });
  }

  return response;
}

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicRoute(req);

  if (!isPublic) {
    await auth.protect();
  }

  // Récupérer la réponse de Clerk
  const response = NextResponse.next();

  // Appliquer les fonctionnalités personnalisées existantes
  return handleCustomFeatures(req, response);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
