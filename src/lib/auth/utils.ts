import { authClient } from './auth-client';
import { auth } from './auth';
import { headers } from 'next/headers';

// signOut function moved to AuthRedirectManager and logout components
// This prevents conflicts with multiple redirect implementations

export async function getSession() {
  try {
    const { data: session, error } = await authClient.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Get session failed:', error);
    return null;
  }
}

// Server-side session getter
export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user || null;
  } catch (error) {
    console.error('Get current user failed:', error);
    return null;
  }
}

// Server-side session getter (full session)
export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session || null;
  } catch (error) {
    console.error('Get current session failed:', error);
    return null;
  }
}
