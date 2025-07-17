'use client';

import { useSession } from 'next-auth/react';
import type { SessionUser } from '@/lib/user';

// Hook pour utiliser le contexte utilisateur
export function useCurrentUser() {
  const session = useSession();

  return {
    user: session.data?.user as SessionUser,
  };
}
