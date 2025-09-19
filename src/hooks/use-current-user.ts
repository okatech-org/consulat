'use client';

import { useAuth } from '@/contexts/auth-context';

export function useCurrentUser() {
  const { user } = useAuth();

  if (!user) {
    return {
      user: null,
    };
  }

  return {
    user,
  };
}
