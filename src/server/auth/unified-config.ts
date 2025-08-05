import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { db } from '@/server/db';
import { unifiedLoginProvider, unifiedSignupProvider } from './unified-verify-provider';
import type { SessionUser } from '@/lib/user';
import { getUserSession } from '@/lib/getters';
import { UserRole } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from 'next-auth/jwt';
import { ROUTES } from '@/schemas/routes';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: SessionUser;
  }

  interface User {
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    email: string;
    name: string;
    image: string;
  }
}

/**
 * Configuration NextAuth.js avec les providers unifiés Twilio Verify
 * Utilise Twilio Verify pour SMS/call et Resend pour les emails
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const unifiedAuthConfig = {
  providers: [unifiedLoginProvider, unifiedSignupProvider],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: ROUTES.auth.login,
    error: ROUTES.auth.auth_error,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Récupérer les données complètes de l'utilisateur depuis la base de données
      if (token?.id && token?.role && typeof token.id === 'string') {
        const user = await getUserSession(token.id, token.role as UserRole);
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session.user = user as any;
        }
      }
      return session;
    },
    signIn: async () => {
      // Pour tous les cas, créer une session normale
      return true;
    },
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      console.log('User signed in:', {
        userId: user.id,
        provider: account?.provider,
        email: user.email,
      });
    },
    signOut: async ({ session, token }) => {
      console.log('User signed out:', {
        userId: session?.user?.id || token?.id,
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
