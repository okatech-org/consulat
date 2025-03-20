'use client';

import {
  ChevronsUpDown,
  LogOut,
  MoonIcon,
  SunIcon,
  UserIcon,
  MessageSquare,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { logUserOut } from '@/actions/auth';
import { useTheme } from 'next-themes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';
import { UserRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { SessionUser } from '@/types/user';

export function NavUser({
  user,
  showFeedback = true,
}: {
  user: SessionUser;
  showFeedback?: boolean;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu>
        {showFeedback && (
          <SidebarMenuItem className="hidden md:block">
            <SidebarMenuButton>
              <MessageSquare className="size-8" />
              <span>{t('common.actions.feedback')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="sm"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name ?? ''} />
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {user.name?.slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate hidden sm:inline text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile || !showFeedback ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name ?? ''} />
                    ) : (
                      <AvatarFallback className="rounded-lg">
                        {user.name?.slice(0, 2)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    {user.email && <span className="truncate text-xs">{user.email}</span>}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    if (hasAnyRole(user, [UserRole.SUPER_ADMIN, UserRole.ADMIN])) {
                      router.push(ROUTES.dashboard.account_settings);
                    }

                    if (hasAnyRole(user, [UserRole.USER])) {
                      router.push(ROUTES.user.account);
                    }
                  }}
                >
                  <UserIcon className="size-icon" />
                  {t('navigation.my_account')}
                </DropdownMenuItem>
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
                      {t('navigation.light_mode')}
                    </>
                  ) : (
                    <>
                      <MoonIcon className={'w-4'} />
                      {t('navigation.dark_mode')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (hasAnyRole(user, ['USER'])) {
                      router.push(ROUTES.user.feedback);
                    } else {
                      router.push(ROUTES.dashboard.feedback);
                    }
                  }}
                >
                  <MessageSquare className="size-4" />
                  <span>{t('common.actions.feedback')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logUserOut();
                }}
              >
                <LogOut />
                {t('auth.actions.logout')}
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
