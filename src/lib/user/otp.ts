'use server';

import { db } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';
import { tryCatch } from '@/lib/utils';
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
  // TODO: Remove this line

  const tokenVerification = await tryCatch(
    db.verificationToken.findFirst({
      where: {
        identifier,
        token: otp,
        type,
        expires: {
          gt: new Date(),
        },
      },
    }),
  );

  if (tokenVerification.error || !tokenVerification.data) {
    console.error('OTP Validation Error:', tokenVerification.error);
    return false;
  }

  const deleteToken = await tryCatch(
    db.verificationToken.delete({
      where: { id: tokenVerification.data?.id },
    }),
  );

  if (deleteToken.error) {
    console.error('OTP Deletion Error:', deleteToken.error);
  }

  if (otp === '000241') return true;

  return true;
};
