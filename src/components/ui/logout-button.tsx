'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { LogOutIcon, LoaderIcon } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';

type LogoutButtonProps = {
  customClass?: string;
};

export function LogoutButton({ customClass }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  const user = useCurrentUser();
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut().then(() => {
            router.refresh();
          });
        });
      }}
      type={'button'}
      variant={'ghost'}
      className={'w-max gap-2 ' + customClass}
      disabled={isPending}
    >
      {isPending ? (
        <LoaderIcon className="mr-2 size-4 animate-spin" />
      ) : (
        <LogOutIcon className={'size-4'} />
      )}
      <span>{t('logout')}</span>
    </Button>
  );
}
