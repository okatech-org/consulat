'use client';

import { authClient } from '@/lib/auth/auth-client';
import { SessionUser } from '@/types';
import { useMemo } from 'react';

export const useCurrentUser = (): SessionUser | null => {
  const { data: session } = authClient.useSession();
  return useMemo(() => (session?.user as SessionUser) || null, [session?.user]);
};

export const useCurrentSession = () => {
  // The useSession hook from authClient likely has its own caching mechanism
  return authClient.useSession();
};
