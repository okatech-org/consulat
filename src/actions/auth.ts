'use server';

import { signOut } from '@/auth';
import { db } from '@/lib/prisma';
import { generateOTP, saveHashedOTP } from '@/lib/user/otp';
import { notifyValidationCode } from '@/lib/services/notifications';
import { tryCatch } from '@/lib/utils';

export const logUserOut = async () => {
  await signOut({
    redirectTo: '/',
  });
};

export type AuthType = 'EMAIL' | 'PHONE';

export async function sendOTP(identifier: string, type: AuthType) {
  try {
    const generatedOTP = await generateOTP();

    const saveResult = await saveHashedOTP({
      identifier,
      otp: generatedOTP,
      type,
    });

    if (!saveResult.success) {
      console.error('Error saving OTP:', saveResult.error);
      return { error: saveResult.error, waitTime: saveResult.waitTime };
    }

    const notificationResult = await tryCatch(
      notifyValidationCode(generatedOTP, {
        ...(type === 'EMAIL' && { email: identifier }),
        ...(type === 'PHONE' && { phoneNumber: identifier.replaceAll('-', '') }),
      }),
    );

    if (notificationResult.error) {
      console.error('Error sending OTP:', notificationResult.error);
      return { error: 'Failed to send verification code' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { error: 'Failed to send verification code' };
  }
}

export async function isUserExists(id?: string, email?: string, phoneNumber?: string) {
  const user = await db.user.findFirst({
    where: {
      OR: [
        ...(id ? [{ id }] : []),
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });
  return Boolean(user);
}
