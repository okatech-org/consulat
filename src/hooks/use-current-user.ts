'use client';

import { useAuth } from '@/contexts/auth-context';

export function useCurrentUser() {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
  };
}
