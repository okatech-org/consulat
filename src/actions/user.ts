'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { AgentSettings, AdminSettings, UserSettings } from '@/schemas/user';
import { SessionUser } from '@/types';
import { User } from '@prisma/client';

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await auth();

  return session?.user as SessionUser;
};

export const checkUserExist = async (userId?: string) => {
  if (!userId) return false;
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

export const getUserByPhone = async (phoneNumber: string): Promise<User | null> => {
  return await db.user.findFirst({
    where: {
      phoneNumber,
    },
  });
};

export const updateUserData = async (
  userId: string,
  data: AgentSettings | AdminSettings | UserSettings,
) => {
  return await db.user.update({
    where: {
      id: userId,
    },
    // @ts-expect-error - data is a partial of User
    data: {
      ...data,
    },
  });
};
