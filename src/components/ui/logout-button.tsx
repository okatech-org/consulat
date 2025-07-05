'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { LogOutIcon } from 'lucide-react';
import { useCurrentUser } from '@/contexts/user-context';
import { AuthRedirectManager } from '@/lib/auth/redirect-utils';
import { signOut } from 'next-auth/react';

type LogoutButtonProps = { customClass?: string; redirectUrl?: string };

export function LogoutButton({ customClass, redirectUrl }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  const { user } = useCurrentUser();
  const [isPending, startTransition] = React.useTransition();
  const [hasLoggedOut, setHasLoggedOut] = React.useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (hasLoggedOut) return;

    try {
      setHasLoggedOut(true);

      await signOut({ redirectTo: '/' });
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
