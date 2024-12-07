import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/prisma'
import { User } from '@prisma/client'
import { ROUTES } from '@/schemas/routes'
import { getUserById } from '@/lib/user/getters'
import authConfig from '@/auth.config'

declare module 'next-auth' {
  interface Session {
    user: User
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
        console.log('existingUser', existingUser)
        if (existingUser) {
          session.user.role = existingUser.role
          session.user.phone = existingUser.phone
          session.user.lastLogin = existingUser.lastLogin ?? new Date()
          if (existingUser.consulateId) {
            session.user.consulateId = existingUser.consulateId
          }
        }
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token }) {
      return token
    }
  },
  session: { strategy: 'jwt' },
  ...authConfig,
})