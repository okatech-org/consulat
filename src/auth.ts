import NextAuth, { Session } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/prisma';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/user/getters';
import { FullUser } from '@/types';
import { validateOTP } from '@/lib/user/otp';
import { extractNumber } from '@/lib/utils';
import { Country, Phone, User, UserRole } from '@prisma/client';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: User & {
      phone: Phone | null;
      linkedCountries: Country[];
    };
  }
}

export interface AuthPayload {
  identifier: string;
  type: 'EMAIL' | 'PHONE';
  otp: string;
  callbackUrl?: string;
}

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
        type: { type: 'text' },
        otp: { type: 'text' },
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
    if (!credentials) return new Error('No credentials');
    const { identifier, type, otp } = credentials as unknown as AuthPayload;

    if (!identifier || !otp) {
      return new Error('Missing credentials');
    }

    const isValid = await validateOTP({
      identifier,
      otp,
      type,
    });

    if (!isValid) {
      return null;
    }

    // Trouver ou créer l'utilisateur
    const userWhere =
      type === 'EMAIL'
        ? { email: identifier }
        : { phone: { number: extractNumber(identifier).number } };

    let user = await db.user.findFirst({
      where: userWhere,
      select: {
        id: true,
        email: true,
        roles: true,
        phone: true,
        lastLogin: true,
        organizationId: true,
        assignedOrganizationId: true,
        countryCode: true,
        specializations: true,
        linkedCountries: true,
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          ...(type === 'EMAIL'
            ? { email: identifier }
            : { phone: { create: extractNumber(identifier) } }),
          emailVerified: type === 'EMAIL' ? new Date() : null,
          phoneVerified: type === 'PHONE' ? new Date() : null,
          roles: [UserRole.USER], // Rôle par défaut
        },
        select: {
          id: true,
          email: true,
          roles: true,
          phone: true,
          lastLogin: true,
          organizationId: true,
          assignedOrganizationId: true,
          countryCode: true,
          specializations: true,
          linkedCountries: true,
        },
      });
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
