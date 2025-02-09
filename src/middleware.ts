import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  // Setup nonce pour la sécurité
  const nonce = nanoid();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  // Autoriser l'accès pour toutes les autres routes
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('x-current-path', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
