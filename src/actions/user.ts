'use server';

import { db } from '@/server/db';
import { type User, UserRole } from '@prisma/client';
import { createClerkClient } from '@clerk/nextjs/server';

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

export const updateUserData = async (userId: string, data: Partial<User>) => {
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

export async function syncUserWithDatabase(userId: string | null) {
  console.log('Syncing user with database', userId);
  if (!userId) {
    return;
  }

  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (user) {
    console.log('User already exists in database');
  }

  if (!user) {
    console.log('User not found in database, syncing with Clerk');
    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser) {
      console.log('User not found in Clerk');
      return;
    }

    console.log('User found in Clerk', clerkUser);

    const email = clerkUser.phoneNumbers[0]?.phoneNumber;
    const phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber;

    if (!email && !phoneNumber) {
      console.log('User has no email or phone number');
      return;
    }

    const roles = clerkUser.publicMetadata.roles as UserRole[] | undefined;

    try {
      await db.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: clerkUser.firstName,
          phoneNumber: phoneNumber,
          roles: roles || [UserRole.USER],
        },
      });
    } catch (error) {
      console.error('Error syncing user with database', error);
    }
  }
}
