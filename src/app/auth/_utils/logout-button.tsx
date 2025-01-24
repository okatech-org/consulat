'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { logUserOut } from '@/actions/auth';
import * as React from 'react';
import { LogOut } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  const user = useCurrentUser();
  const [isPending, startTransition] = React.useTransition();

  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await logUserOut().then(() => {
            window.location.reload();
          });
        });
      }}
      variant="ghost"
      className={cn('w-full gap-2', className)}
      disabled={isPending}
    >
      {isPending ? (
        <Icons.Spinner className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      <span>{t('logout')}</span>
    </Button>
  );
}
