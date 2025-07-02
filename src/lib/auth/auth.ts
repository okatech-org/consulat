import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/prisma';
import { phoneNumber, emailOTP, customSession } from 'better-auth/plugins';
import { sendSMSOTP } from '@/actions/email';
import { sendOTPEmail } from '../services/notifications/providers/emails';
import { env } from '../env';
import { getUserSession } from '../user/getters';

const options = {
  emailAndPassword: {
    enabled: false,
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge:  60 * 60 * 24 * 7,
    }
  },
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
        try {
          await sendSMSOTP(phoneNumber, code);
        } catch (error) {
          console.error('Failed to send SMS OTP:', error);
          throw error;
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
        try {
          await sendOTPEmail(email, otp);
        } catch (error) {
          console.error('Failed to send email OTP:', error);
          throw error;
        }
      },
      allowedAttempts: 5,
      expiresIn: 300,
    }),
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