
import { auth } from '@/server/auth';

// Server-side session getter
export async function getCurrentUser() {
  try {
    const session = await auth();

    return session?.user || null;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}
