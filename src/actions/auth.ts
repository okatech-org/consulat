'use server';

import { signOut } from '@/next-auth';
import { db } from '@/lib/prisma';

export const logUserOut = async () => {
  await signOut({
    redirectTo: '/',
  });
};

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
