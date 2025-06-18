import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/prisma';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { sendSMSOTP } from '@/actions/email';
import { tryCatch } from '../utils';
import { sendOTPEmail } from '../services/notifications/providers/emails';
import { nextCookies } from 'better-auth/next-js';
import { env } from '../env';
import { getUserSession } from '../user/getters';

const options = {
  emailAndPassword: {
    enabled: false,
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  user: {
    modelName: 'User',
    additionalFields: {
      role: {
        type: ['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER', 'AGENT'] as const,
        required: true,
      },
      phoneNumber: {
        type: 'string',
        required: true,
      },
      profileId: {
        type: 'string',
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
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ session, user }) => {
      const userSessionData = await getUserSession(user.id, user.role);
      return {
        session: {
          expiresAt: session.expiresAt,
          token: session.token,
          userAgent: session.userAgent,
        },
        user: userSessionData,
      };
    }, options),
  ],
});

export type Session = typeof auth.$Infer.Session;
