import { authClient } from '@/lib/auth/auth-client';

export const useCurrentUser = () => {
  const { data: session } = authClient.useSession();
  console.log('useCurrentUser', session);
  return session?.user;
};

export const useCurrentSession = () => {
  return authClient.useSession();
};
