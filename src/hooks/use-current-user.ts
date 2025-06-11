import { authClient } from '@/lib/auth/auth-client';
import { SessionUser } from '@/types';

export const useCurrentUser = (): SessionUser | null => {
  const { data: session } = authClient.useSession();
  return session?.user as SessionUser;
};

export const useCurrentSession = () => {
  return authClient.useSession();
};
