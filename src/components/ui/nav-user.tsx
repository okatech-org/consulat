'use client';

import { HomeIcon, LogOut, MoonIcon, MoreVerticalIcon, SunIcon } from 'lucide-react';

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
import { useUserInfo } from '@/contexts/user-context';
import { signOut } from 'next-auth/react';

export function NavUser() {
  const userInfos = useUserInfo();
  const { isMobile } = useSidebar();
  const t = useTranslations();
  const { setTheme, resolvedTheme } = useTheme();
  const isAdmin = userInfos.role !== 'USER';
  const initials = userInfos.name
    .split(' ')
    .slice(0, 1)
    .map((name) => name[0])
    .join('. ');
  const name = userInfos.name.split(' ').slice(1).join(' ').trim();

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
                {userInfos.image ? (
                  <AvatarImage src={userInfos.image} alt={userInfos.name} />
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {userInfos.initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {name} {initials}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {userInfos.email}
                </span>
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
                  {userInfos.image ? (
                    <AvatarImage src={userInfos.image} alt={userInfos.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg">
                      {userInfos.initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {name} {initials}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userInfos.email ?? ''}
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
                  <Link href={isAdmin ? ROUTES.dashboard.base : ROUTES.user.base}>
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
            <DropdownMenuItem
              onClick={async () => {
                await signOut({ redirectTo: '/' });
              }}
            >
              <LogOut className="size-icon" />
              {t('auth.actions.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
