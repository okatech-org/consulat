import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/registration(.*)',
  '/feedback(.*)',
  '/legal(.*)',
  '/unauthorized(.*)',
  '/listing(.*)',
  '/',
]);

export default clerkMiddleware(async (auth, req) => {
  const isPublic = isPublicRoute(req);

  if (!isPublic) {
    await auth.protect();
  }

  // Create the response
  const response = NextResponse.next();

  // Handle theme
  const theme = req.cookies.get('theme')?.value;
  if (theme && ['light', 'dark', 'system'].includes(theme)) {
    response.headers.set('X-Theme', theme);
    response.cookies.set('theme', theme, {
      path: '/',
      maxAge: 31536000,
      secure: true,
      sameSite: 'lax',
    });
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
