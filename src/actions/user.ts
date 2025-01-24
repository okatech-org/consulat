'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';

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
