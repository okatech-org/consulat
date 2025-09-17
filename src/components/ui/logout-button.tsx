'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOutIcon } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

type LogoutButtonProps = { customClass?: string; redirectUrl?: string };

export function LogoutButton({ customClass }: LogoutButtonProps) {
  const t = useTranslations('auth.actions');
  return (
    <SignOutButton>
      <Button
        variant="ghost"
        className={`w-max ${customClass || ''}`}
        leftIcon={<LogOutIcon className={'size-icon'} />}
      >
        {t('logout')}
      </Button>
    </SignOutButton>
  );
}
