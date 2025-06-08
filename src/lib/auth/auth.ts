import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from '@/lib/prisma';
import { phoneNumber, emailOTP } from 'better-auth/plugins';
import { sendSMSOTP } from '@/actions/email';
import { tryCatch } from '../utils';
import { sendOTPEmail } from '../services/notifications/providers/emails';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: false,
  },
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
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
  ],
});
