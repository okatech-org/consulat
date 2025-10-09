'use client';

import { api } from 'convex/_generated/api';
import { useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';

export function useCurrentUser() {
  const { userId } = useAuth();

  if (!userId) {
    return {
      user: null,
    };
  }

  const user = useQuery(api.functions.user.getUserByClerkId, {
    clerkUserId: userId,
  });

  return {
    user,
  };
}
