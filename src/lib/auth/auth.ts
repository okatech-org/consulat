import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/prisma';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { sendSMSOTP } from '@/actions/email';
import { tryCatch } from '../utils';
import { sendOTPEmail } from '../services/notifications/providers/emails';
import { nextCookies } from 'better-auth/next-js';
import { getUserSession } from '../user/getters';
import { UserRole, Session as PrismaSession } from '@prisma/client';
import { env } from '../env';
import { SessionUser } from '@/types';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: false,
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  user: {
    modelName: 'User',
    additionalFields: {
      roles: {
        type: 'string',
        enum: UserRole,
        required: true,
      },
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        const result = await tryCatch(sendSMSOTP(phoneNumber, code));

        if (result.error) {
          throw new Error('Failed to send OTP');
        }
      },
      allowedAttempts: 5,
      expiresIn: 300,
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@${env.BETTER_AUTH_URL}`;
        },
        getTempName: (phoneNumber) => {
          return phoneNumber;
        },
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const result = await tryCatch(sendOTPEmail(email, otp));

        if (result.error) {
          throw new Error('Failed to send OTP');
        }
      },
      allowedAttempts: 5,
      expiresIn: 300,
    }),
    nextCookies(),
    customSession(sessionCustomizer),
  ],
});

export type Session = typeof auth.$Infer.Session;

async function sessionCustomizer({
  session,
  user,
}: {
  session: PrismaSession;
  user: SessionUser;
}) {
  const userRoles = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      roles: true,
    },
  });

  const userSessionData = await getUserSession(user.id, userRoles?.roles ?? []);

  return {
    ...session,
    user: {
      ...user,
      ...userSessionData,
    },
  };
}
