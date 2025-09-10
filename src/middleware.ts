import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  const searchParams = request.nextUrl.searchParams.toString();

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
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
