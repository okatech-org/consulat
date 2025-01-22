import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_AUTH_REDIRECT,
  publicRoutes,
} from '@/routes'
import { ROUTES } from '@/schemas/routes'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Setup nonce pour la sécurité
  const nonce = nanoid()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  // Vérification des types de routes
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isAuthRoute = authRoutes.some((route) => nextUrl.pathname === route)
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === ROUTES.base) {
      return nextUrl.pathname === route
    }
    return nextUrl.pathname === route
  })

  // Autoriser les routes API auth
  if (isApiAuthRoute) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  // Autoriser les routes publiques
  if (isPublicRoute) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  // Rediriger les utilisateurs connectés qui tentent d'accéder aux pages d'auth
  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL(DEFAULT_AUTH_REDIRECT, nextUrl))
  }

  // Vérifier l'authentification pour les routes protégées
  if (!isLoggedIn && !isAuthRoute) {
    const callbackUrl = nextUrl.pathname
    return Response.redirect(
      new URL(`${ROUTES.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    )
  }

  // Autoriser l'accès pour toutes les autres routes
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}