import { authClient } from './auth-client';
import { auth } from './auth';
import { headers } from 'next/headers';

export async function signOut(redirectUrl?: string) {
  try {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = '/login';
          }
        },
        onError: (error) => {
          console.error('Sign out error:', error);
          // Still redirect on error to ensure user is logged out from UI
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.href = '/login';
          }
        },
      },
    });
  } catch (error) {
    console.error('Sign out failed:', error);
    // Fallback redirect
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/login';
    }
  }
}

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
