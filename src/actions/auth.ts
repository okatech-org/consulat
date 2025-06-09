'use server';

import { db } from '@/lib/prisma';

export async function isUserExists(id?: string, email?: string, phoneNumber?: string) {
  const user = await db.user.findFirst({
    where: {
      OR: [
        ...(id ? [{ id }] : []),
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });
  return Boolean(user);
}
