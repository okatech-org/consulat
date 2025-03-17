import NextAuth, { Session } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/prisma';
import { ROUTES } from '@/schemas/routes';
import { getUserSession } from '@/lib/user/getters';
import { SessionUser } from '@/types';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}

type PhoneAuthPayload = {
  identifier: string;
  type: 'PHONE';
  otp: string;
  callbackUrl?: string;
};

type EmailAuthPayload = {
  identifier: string;
  type: 'EMAIL';
  otp: string;
  callbackUrl?: string;
};

export type AuthPayload = PhoneAuthPayload | EmailAuthPayload;

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

async function handleAuthorize(credentials: unknown) {
  try {
    if (!credentials) return new Error('no_credentials');
    const { identifier, type } = credentials as unknown as AuthPayload;

    if (!identifier || !type) {
      return new Error('missing_credentials');
    }

    // For phone authentication, first find the phone record to get its ID
    if (type === 'PHONE') {
      const phone = await db.phone.findUnique({
        where: {
          number: identifier,
        },
      });

      if (!phone) {
        return new Error('user_not_found');
      }

      // Then find the user with this phoneId
      const user = await db.user.findUnique({
        where: {
          phoneId: phone.id,
        },
      });

      if (!user) {
        return new Error('user_not_found');
      }

      return user;
    }

    // For email authentication
    if (type === 'EMAIL') {
      const user = await db.user.findUnique({
        where: {
          email: identifier,
        },
      });

      if (!user) {
        return new Error('user_not_found');
      }

      return user;
    }

    return null;
  } catch (error) {
    console.error('Auth Error:', error);
    return null;
  }
}

async function handleSession({ session, token }: { session: Session; token: JWT }) {
  if (token.sub && session.user) {
    const existingUser = await getUserSession(token.sub);

    if (existingUser) {
      session.user = existingUser;
    }
  }

  return session;
}
