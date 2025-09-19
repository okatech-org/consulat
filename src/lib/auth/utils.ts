import { auth } from '@clerk/nextjs/server';
import type { SessionUser } from '@/types';
import { db } from '@/server/db';

// Server-side session getter
export async function getCurrentUser(): Promise<SessionUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        roles: true,
        profileId: true,
        assignedOrganizationId: true,
        organizationId: true,
        countryCode: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
