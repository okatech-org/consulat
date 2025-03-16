'use server';

import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { User } from '@prisma/client';
import { tryCatch } from '@/lib/utils';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  maxActiveRequests: z.coerce.number().optional(),
  specializations: z.array(z.string()).optional(),
});

export async function updateUserProfile(formData: FormData) {
  return tryCatch(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const data = Object.fromEntries(formData.entries());
    const validatedData = updateProfileSchema.parse(data);

    const user = await db.user.update({
      where: { id: session.user.id },
      data: validatedData,
    });

    revalidatePath('/my-space/account');
    revalidatePath('/dashboard/account');

    return user;
  });
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, boolean>,
) {
  return tryCatch(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Update or create notification preferences
    const updatedPreferences = await Promise.all(
      Object.entries(preferences).map(([type, enabled]) =>
        db.notificationPreference.upsert({
          where: {
            userId_type_channel: {
              userId,
              type,
              channel: 'app',
            },
          },
          update: { enabled },
          create: {
            userId,
            type,
            channel: 'app',
            enabled,
          },
        }),
      ),
    );

    return updatedPreferences;
  });
}
