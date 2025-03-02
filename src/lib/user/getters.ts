'use server';

import { db } from '@/lib/prisma';
import { FullProfile, FullProfileInclude, FullUser, FullUserInclude } from '@/types';

export async function getUserById(
  id: string | undefined | null,
): Promise<FullUser | null> {
  if (!id) {
    return null;
  }

  try {
    return await db.user.findFirst({
      where: {
        id: id,
      },
      ...FullUserInclude,
    });
  } catch {
    return null;
  }
}

export async function getUserFullProfile(id: string): Promise<FullProfile | null> {
  try {
    return db.profile.findFirst({
      where: { userId: id },
      ...FullProfileInclude,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getUserFullProfileById(id: string): Promise<FullProfile | null> {
  return db.profile.findFirst({
    where: { id: id },
    ...FullProfileInclude,
  });
}
