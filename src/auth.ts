import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/prisma'
import { ROUTES } from '@/schemas/routes'
import { getUserById } from '@/lib/user/getters'
import { FullUser } from '@/types'
import {CredentialsAuthProvider} from "@/lib/auth/credentials-provider";

declare module 'next-auth' {
  interface Session {
    user: FullUser
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signOut,
  signIn,
} = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: ROUTES.login,
    error: ROUTES.auth_error,
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        const existingUser = await getUserById(token.sub)
        if (existingUser) {
          session.user.role = existingUser.role

          if (existingUser.name) {
            session.user.name = existingUser.name
          }

          if (existingUser.phone) {
            session.user.phone = existingUser.phone
          }

          if (existingUser.email) {
            session.user.email = existingUser.email
          }

          session.user.lastLogin = existingUser.lastLogin ?? new Date()

          if (existingUser.consulateId) {
            session.user.consulateId = existingUser.consulateId
          }
        }
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as FullUser).role
      }
      return token
    }
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    CredentialsAuthProvider(),
  ]
})