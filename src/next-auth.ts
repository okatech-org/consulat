import NextAuth, { Session } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/prisma';
import { ROUTES } from '@/schemas/routes';
import { getUserSession } from '@/lib/user/getters';
import { AdminSession, AgentSession, SessionUser, UserSession } from '@/types';
import { JWT } from 'next-auth/jwt';
import { unstable_cache } from 'next/cache';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: UserSession | AgentSession | AdminSession;
  }
}

export type AuthPayload = {
  identifier: string;
  type: 'EMAIL' | 'PHONE';
  otp: string;
  callbackUrl?: string;
};

const isProduction = process.env.NODE_ENV === 'production';

export const {
  handlers: { GET, POST },
  auth,
  signOut,
  signIn,
} = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: ROUTES.auth.login,
    error: ROUTES.auth.auth_error,
  },
  // Configuration des cookies sécurisés et protection CSRF
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      return handleSession({ session, token });
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as SessionUser).roles;
      }
      return token;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { type: 'string' },
        type: { type: 'enum', enum: ['EMAIL', 'PHONE'] },
        callbackUrl: { type: 'text' },
      },
      async authorize(credentials) {
        return handleAuthorize(credentials);
      },
    }),
  ],
});

const getCachedUserSession = unstable_cache(
  async (userId: string, roles: UserRole[]) => {
    return getUserSession(userId, roles);
  },
  ['user-session'],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ['user-session'],
  },
);

async function handleAuthorize(credentials: unknown) {
  try {
    if (!credentials) return new Error('no_credentials');
    const { identifier, type } = credentials as unknown as AuthPayload;

    if (!identifier || !type) {
      return new Error('missing_credentials');
    }

    const user = await db.user.findUnique({
      where: type === 'EMAIL' ? { email: identifier } : { phoneNumber: identifier },
    });

    if (!user) {
      return new Error('user_not_found');
    }

    return user;
  } catch (error) {
    console.error('Auth Error:', error);
    return null;
  }
}

async function handleSession({ session, token }: { session: Session; token: JWT }) {
  if (token.sub && session.user) {
    const existingUser = await getCachedUserSession(token.sub, token.roles as UserRole[]);

    if (existingUser) {
      session.user = existingUser;
    }
  }

  return session;
}
