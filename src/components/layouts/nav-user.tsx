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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { hasAnyRole } from '@/lib/permissions/utils';
import { ROUTES } from '@/schemas/routes';
import { UserRole } from '@prisma/client';
import { Session } from '@/lib/auth/auth-client';
import Link from 'next/link';
import { NotificationBell } from '../notifications/notification-bell';
import { ChatToggle } from '../chat/chat-toggle';
import { authClient } from '@/lib/auth/auth-client';

export function NavUser({
  user,
  showFeedback = true,
}: {
  user: Session['user'];
  showFeedback?: boolean;
}) {
  const { isMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations();
  const isAdmin = hasAnyRole(user, [
    UserRole.MANAGER,
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.AGENT,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu className={!showFeedback ? 'flex flex-row items-center gap-2' : ''}>
        {showFeedback && (
          <SidebarMenuButton
            tooltip={t('common.actions.feedback')}
            size="lg"
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
        {!showFeedback && (
          <SidebarMenuItem className="hidden md:block">
            <ChatToggle />
          </SidebarMenuItem>
        )}
        {!showFeedback && (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={'Notifications'}
              size="lg"
              className="flex w-full items-center gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <NotificationBell />
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <SidebarMenuButton
                tooltip={'Mon compte'}
                size="lg"
                className="flex w-full items-center gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {!showFeedback && (
                  <>
                    <div className="flex items-center gap-1">
                      <Avatar className="size-8 rounded-md">
                        {user.image ? (
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name ?? ''}
                          />
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
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <SidebarMenuButton
                    tooltip={t('navigation.my_space')}
                    size="lg"
                    className="flex items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    asChild
                  >
                    <Link href={isAdmin ? ROUTES.dashboard.base : ROUTES.user.base}>
                      <LayoutDashboard className="size-icon" />
                      {t('navigation.my_space')}
                    </Link>
                  </SidebarMenuButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hidden md:flex">
                  <SidebarMenuButton
                    tooltip={t('navigation.my_account')}
                    size="lg"
                    className="items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                <DropdownMenuItem asChild className="hidden md:flex">
                  <SidebarMenuButton
                    tooltip={'Dark mode'}
                    size="lg"
                    className="items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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

                <DropdownMenuItem asChild className="hidden md:flex">
                  <SidebarMenuButton
                    tooltip={t('common.actions.feedback')}
                    size="lg"
                    className="items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
                  await authClient.signOut();
                }}
              >
                <LogOut className="size-icon" />
                {t('auth.actions.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
