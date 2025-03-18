'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logUserOut } from '@/actions/auth';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { useRouter } from 'next/navigation';
import { UserIcon, UsersIcon } from 'lucide-react';
import { SessionUser } from '@/types';

export function UserNav({ user }: { user: SessionUser }) {
  const router = useRouter();
  const t = useTranslations();
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-10 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src="/images/avatar-placeholder.png" alt="@shadcn" />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'AGENT', 'MANAGER']) && (
            <DropdownMenuItem
              onClick={() => {
                router.push(ROUTES.dashboard.base);
              }}
            >
              <UsersIcon className="size-4" />
              <span>{t('auth.actions.my_space')}</span>
            </DropdownMenuItem>
          )}

          {hasAnyRole(user, ['USER']) && (
            <DropdownMenuItem
              onClick={() => {
                router.push(ROUTES.user.base);
              }}
            >
              <UserIcon className="size-4" />
              <span>{t('auth.actions.my_space')}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => {
              if (resolvedTheme === 'dark') {
                setTheme('light');
              } else {
                setTheme('dark');
              }
            }}
          >
            {resolvedTheme === 'dark' ? (
              <>
                <SunIcon className={'w-4'} />
                <span>{t('auth.actions.light')}</span>
              </>
            ) : (
              <>
                <MoonIcon className={'w-4'} />
                <span>{t('auth.actions.dark')}</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logUserOut();
          }}
        >
          {t('auth.actions.logout')}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
