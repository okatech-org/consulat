import { authClient } from '@/lib/auth/auth-client';
import { SessionUser } from '@/types';

export const useCurrentUser = (): SessionUser | null => {
  const { data: session } = authClient.useSession();
  console.log({
    session,
  });
  return session?.user as unknown as SessionUser | null;
};

export const useCurrentSession = () => {
  return authClient.useSession();
};
