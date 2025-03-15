'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { User } from '@prisma/client';

export const getCurrentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const checkUserExist = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return !!user;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await db.user.findFirst({
    where: {
      email,
    },
  });
};

export const getUserByPhone = async (phone: {
  countryCode: string;
  number: string;
}): Promise<User | null> => {
  return await db.user.findFirst({
    where: {
      phone,
    },
  });
};
