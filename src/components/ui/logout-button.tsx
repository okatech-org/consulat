'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { LogOutIcon, LoaderIcon } from 'lucide-react';
import { useCurrentUser } from '@/contexts/user-context';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { ROUTES } from '@/schemas/routes';
import { AuthRedirectManager } from '@/lib/auth/redirect-utils';

type LogoutButtonProps = {
  customClass?: string;
  redirectUrl?: string;
};

export function LogoutButton({ customClass, redirectUrl }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  const { user } = useCurrentUser();
  const [isPending, startTransition] = React.useTransition();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (hasLoggedOut) return;

    try {
      setHasLoggedOut(true);

      // Sign out using authClient
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // Use centralized redirect logic
            AuthRedirectManager.handleLogoutSuccess({
              fallbackUrl: redirectUrl,
              method: 'replace',
            });
          },
          onError: (error) => {
            console.error('Sign out error:', error);
            // Still redirect on error to ensure user is logged out from UI
            AuthRedirectManager.handleLogoutSuccess({
              fallbackUrl: redirectUrl,
              method: 'replace',
            });
          },
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: still redirect to clear UI state
      AuthRedirectManager.handleLogoutSuccess({
        fallbackUrl: redirectUrl,
        method: 'replace',
      });
    }
  };

  return (
    <Button
      onClick={() => {
        startTransition(handleLogout);
      }}
      type="button"
      variant="ghost"
      className={`w-max ${customClass || ''}`}
      disabled={isPending || hasLoggedOut}
      leftIcon={<LogOutIcon className={'size-icon'} />}
    >
      {t('logout')}
    </Button>
  );
}
