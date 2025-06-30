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

/**
 * Vérifie si un utilisateur existe dans la base de données
 */
export const checkUserExists = async (identifier: string, type: 'email' | 'phone') => {
  'use server';
  
  try {
    if (type === 'email') {
      const user = await db.user.findUnique({
        where: { email: identifier },
      });
      return { exists: !!user };
    } else {
      const user = await db.user.findUnique({
        where: { phoneNumber: identifier },
      });
      return { exists: !!user };
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return { exists: false, error: 'Database error' };
  }
};
