'use server';

import { signOut } from '@/auth';
import { db } from '@/lib/prisma';
import { generateOTP } from '@/lib/user/otp';
import { sendOTPEmail, sendSMSOTP } from '@/actions/email';

export const logUserOut = async () => {
  await signOut();
};

export type AuthType = 'EMAIL' | 'PHONE';

export async function sendOTP(identifier: string, type: AuthType) {
  try {
    const generatedOTP = await generateOTP();

    // Supprimer tout OTP existant pour cet identifiant
    await db.verificationToken.deleteMany({
      where: {
        identifier,
        type,
      },
    });

    // Créer nouveau token
    await db.verificationToken.create({
      data: {
        identifier,
        token: generatedOTP,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        type,
      },
    });

    // Envoyer l'OTP via le canal approprié
    if (type === 'EMAIL') {
      await sendOTPEmail(identifier, generatedOTP);
    } else {
      await sendSMSOTP(identifier, generatedOTP);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { error: 'Failed to send verification code' };
  }
}
