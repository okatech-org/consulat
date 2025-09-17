import { getCurrentUserFromClerk } from './clerk-utils';
import type { SessionUser } from '@/types';

// Server-side session getter
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const user = await getCurrentUserFromClerk();

    return user;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
