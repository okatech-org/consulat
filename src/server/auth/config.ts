import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { db } from '@/server/db';
import { otpProvider } from './otp-provider';
import { signupProvider } from './signup-provider';
import { createOTPAuthProvider } from './otp-auth-provider';
import { createSignupOTPProvider } from './signup-auth-provider';
import { sendOTPViaNotifications } from '@/lib/services/notifications/otp-integration';
import type { SessionUser } from '@/lib/user';
import { UserRole } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from 'next-auth/jwt';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/getters';
const authOtpProvider = createOTPAuthProvider({
  sendOTP: sendOTPViaNotifications,
  codeLength: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
});

const signupOtpProvider = createSignupOTPProvider({
  sendOTP: sendOTPViaNotifications,
  codeLength: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
});

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
  providers: [otpProvider, signupProvider, authOtpProvider, signupOtpProvider],
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
        token.role = user.role as UserRole;
      }

      return token;
    },
    session: async ({ session, token }) => {
      // Récupérer les données complètes de l'utilisateur depuis la base de données
      if (token?.id && token?.role && typeof token.id === 'string') {
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
