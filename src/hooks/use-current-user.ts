import { useSession } from 'next-auth/react';
import { unstable_cache } from 'next/cache';

export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};

export const useCachedSession = unstable_cache(
  async () => {
    return useSession();
  },
  ['user-session'],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ['user-session-client'],
  },
);
