import NextAuth, { Session } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/prisma';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/user/getters';
import { FullUser } from '@/types';
import { Country, Phone, User } from '@prisma/client';
import { JWT } from 'next-auth/jwt';
import { PhoneValue } from './components/ui/phone-input';

declare module 'next-auth' {
  interface Session {
    user: User & {
      phone: Phone | null;
      linkedCountries: Country[];
    };
  }
}

type PhoneAuthPayload = {
  identifier: PhoneValue;
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
        token.roles = (user as FullUser).roles;
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

    const user = await db.user.findFirst({
      where: {
        ...(type === 'EMAIL' && { email: identifier }),
        ...(type === 'PHONE' && {
          phone: {
            number: {
              equals: identifier.number,
            },
            countryCode: {
              equals: identifier.countryCode,
            },
          },
        }),
      },
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
    const existingUser = await getUserById(token.sub);
    if (existingUser) {
      session.user.roles = existingUser.roles;

      if (existingUser.name) {
        session.user.name = existingUser.name;
      }

      if (existingUser.phone) {
        session.user.phone = existingUser.phone;
      }

      if (existingUser.email) {
        session.user.email = existingUser.email;
      }

      if (existingUser.organizationId) {
        session.user.organizationId = existingUser.organizationId;
      }

      if (existingUser.assignedOrganizationId) {
        session.user.assignedOrganizationId = existingUser.assignedOrganizationId;
      }

      session.user.lastLogin = existingUser.lastLogin ?? new Date();

      if (existingUser.countryCode) {
        session.user.countryCode = existingUser.countryCode;
      }

      if (existingUser.specializations) {
        session.user.specializations = existingUser.specializations;
      }

      if (existingUser.linkedCountries) {
        session.user.linkedCountries = existingUser.linkedCountries;
      }
    }
    session.user.id = token.sub;
  }

  return session;
}
