'use client';

import {
  ChevronsUpDown,
  LogOut,
  MoonIcon,
  SunIcon,
  UserIcon,
  MessageSquare,
  LayoutDashboard,
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
import { SessionUser } from '@/types/user';
import Link from 'next/link';

export function NavUser({
  user,
  showFeedback = true,
}: {
  user: SessionUser;
  showFeedback?: boolean;
}) {
  const { isMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations();
  const isAdmin = hasAnyRole(user, [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.AGENT,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu>
        {showFeedback && (
          <SidebarMenuButton
            tooltip={t('common.actions.feedback')}
            size="md"
            className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            asChild
          >
            <Link
              href={
                hasAnyRole(user, ['USER'])
                  ? ROUTES.user.feedback
                  : ROUTES.dashboard.feedback
              }
            >
              <MessageSquare className="size-icon" />
              <span>{t('common.actions.feedback')}</span>
            </Link>
          </SidebarMenuButton>
        )}
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip={'Mon compte'}
                size="md"
                className="flex w-full items-center gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {!showFeedback && (
                  <>
                    <div className="flex items-center gap-1">
                      <Avatar className="size-8 rounded-md">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name ?? ''} />
                        ) : (
                          <AvatarFallback className="rounded-md">
                            {user.name?.slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex items-center gap-1 w-full justify-between">
                      <div className="flex-col text-left text-sm leading-tight hidden sm:flex">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate hidden sm:inline text-xs">
                          {user.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="size-4" />
                    </div>
                  </>
                )}

                {showFeedback && (
                  <>
                    <div className="flex items-center gap-1">
                      <Avatar className="size-6 rounded-md">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name ?? ''} />
                        ) : (
                          <AvatarFallback className="rounded-lg">
                            {user.name?.slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex items-center gap-1 w-full justify-between">
                      <div className="flex flex-col text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user.name}</span>
                        <span className="truncate hidden sm:inline text-xs">
                          {user.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="size-4" />
                    </div>
                  </>
                )}
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
                <DropdownMenuItem asChild>
                  <SidebarMenuButton
                    tooltip={t('navigation.my_space')}
                    size="md"
                    className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    asChild
                  >
                    <Link href={isAdmin ? ROUTES.dashboard.base : ROUTES.user.base}>
                      <LayoutDashboard className="size-icon" />
                      {t('navigation.my_space')}
                    </Link>
                  </SidebarMenuButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SidebarMenuButton
                    tooltip={t('navigation.my_account')}
                    size="md"
                    className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    asChild
                  >
                    <Link
                      href={
                        isAdmin ? ROUTES.dashboard.account_settings : ROUTES.user.account
                      }
                    >
                      <UserIcon className="size-icon" />
                      {t('navigation.my_account')}
                    </Link>
                  </SidebarMenuButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SidebarMenuButton
                    tooltip={t('navigation.my_account')}
                    size="md"
                    className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                        <SunIcon className={'size-icon'} />
                        {t('navigation.light_mode')}
                      </>
                    ) : (
                      <>
                        <MoonIcon className={'size-icon'} />
                        {t('navigation.dark_mode')}
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <SidebarMenuButton
                    tooltip={t('common.actions.feedback')}
                    size="md"
                    className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    asChild
                  >
                    <Link
                      href={
                        hasAnyRole(user, ['USER'])
                          ? ROUTES.user.feedback
                          : ROUTES.dashboard.feedback
                      }
                    >
                      <MessageSquare className="size-icon" />
                      <span>{t('common.actions.feedback')}</span>
                    </Link>
                  </SidebarMenuButton>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logUserOut();
                }}
              >
                <LogOut className="size-icon" />
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
