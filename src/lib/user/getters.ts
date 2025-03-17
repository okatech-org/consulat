'use server';

import { db } from '@/lib/prisma';
import {
  FullProfile,
  FullProfileInclude,
  FullUser,
  FullUserInclude,
  SessionUserInclude,
} from '@/types';

export async function getUserSession(id: string) {
  return await db.user.findUnique({
    where: { id: id },
    ...SessionUserInclude,
  });
}

export async function getUserById(
  id: string | undefined | null,
): Promise<FullUser | null> {
  if (!id) {
    return null;
  }

  try {
    return await db.user.findUnique({
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
      where: { user: { id: id } },
      ...FullProfileInclude,
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getUserFullProfileById(id: string): Promise<FullProfile | null> {
  return db.profile.findUnique({
    where: { id: id },
    ...FullProfileInclude,
  });
}
