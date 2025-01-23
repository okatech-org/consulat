import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'
import {auth} from "@/auth";

export default auth((req) => {
  // Setup nonce pour la sécurité
  const nonce = nanoid()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)


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