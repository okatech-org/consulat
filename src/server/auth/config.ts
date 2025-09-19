import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { db } from '@/server/db';
import type { SessionUser } from '@/lib/user';
import { UserRole } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from 'next-auth/jwt';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/getters';
import { LoginProvider, SignupProvider } from './auth-providers';
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
    roles?: UserRole[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: UserRole[];
    email: string;
    name: string;
    image: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [LoginProvider, SignupProvider],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: ROUTES.auth.login,
    error: ROUTES.auth.auth_error,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.roles = user.roles as UserRole[];
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Récupérer les données complètes de l'utilisateur depuis la base de données
      if (token?.id && token?.roles && typeof token.id === 'string') {
        const user = await getUserById(token.id);
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          session.user = user as any;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
