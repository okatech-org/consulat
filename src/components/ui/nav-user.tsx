'use client';

import { HomeIcon, MoonIcon, MoreVerticalIcon, SunIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserRole } from '@prisma/client';
import { LogoutButton } from './logout-button';

export function NavUser() {
  const { user } = useCurrentUser();
  if (!user) {
    return undefined;
  }
  const { isMobile } = useSidebar();
  const t = useTranslations();
  const { setTheme, resolvedTheme } = useTheme();
  const initials = user.name
    ?.split(' ')
    .slice(0, 1)
    .map((name) => name[0])
    .join('. ');
  const name = user.name?.split(' ').slice(1).join(' ').trim();

  const dashboardUrl: Record<UserRole, string> = {
    [UserRole.ADMIN]: ROUTES.dashboard.base,
    [UserRole.AGENT]: ROUTES.dashboard.base,
    [UserRole.MANAGER]: ROUTES.dashboard.base,
    [UserRole.SUPER_ADMIN]: ROUTES.dashboard.base,
    [UserRole.INTEL_AGENT]: ROUTES.intel.base,
    [UserRole.USER]: ROUTES.user.base,
    [UserRole.EDUCATION_AGENT]: ROUTES.dashboard.base,
  };

  function getDashboardUrl() {
    if (!user) {
      return ROUTES.user.base;
    }
    if (!user?.roles) {
      return ROUTES.user.base;
    }

    return dashboardUrl[user?.roles[0] as UserRole];
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name ?? ''} />
                ) : (
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {name} {initials}
                </span>
                <span className="truncate text-xs opacity-90">{user.email}</span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name ?? ''} />
                  ) : (
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {name} {initials}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="flex">
                <SidebarMenuButton
                  tooltip={t('navigation.my_space')}
                  className="items-center w-full gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  asChild
                >
                  <Link href={getDashboardUrl()}>
                    <HomeIcon className="size-icon" />
                    {t('navigation.my_space')}
                  </Link>
                </SidebarMenuButton>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hidden md:flex">
                <SidebarMenuButton
                  tooltip={'Dark mode'}
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
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutButton customClass="w-full" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
