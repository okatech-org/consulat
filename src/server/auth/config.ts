import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { db } from '@/server/db';
import { otpProvider } from './otp-provider';
import { signupProvider } from './signup-provider';
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
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    otpProvider,
    signupProvider,
  ],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: ROUTES.auth.login,
    error: ROUTES.auth.auth_error,
  },
  session: {
    strategy: 'jwt', // Utiliser JWT car CredentialsProvider ne fonctionne pas avec database
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      // Lors de la première connexion, ajouter les données de l'utilisateur au token
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
      }

      // Si c'est une connexion via le provider phone/email et que c'est juste l'envoi du code
      if (user?.id === 'temp-sending-code') {
        // Ne pas créer de vraie session
        return token;
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
    signIn: async ({ user }) => {
      // Si c'est juste l'envoi du code, on ne crée pas de session
      if (user.id === 'temp-sending-code') {
        return true; // Permet de continuer sans créer de vraie session
      }

      // Pour tous les autres cas, créer une session normale
      return true;
    },
  },
} satisfies NextAuthConfig;
