'use client';

import * as React from 'react';

import { NavUser } from '@/components/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { env } from '@/env';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { FlagIcon } from './flag-icon';
import { useNavigation } from '@/hooks/use-navigation';
import Image from 'next/image';
import { NavMain } from './nav-main';
import { usePathname } from 'next/navigation';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appName = env.NEXT_PUBLIC_APP_NAME;
  const appLogo = env.NEXT_PUBLIC_ORG_LOGO;
  const { user } = useCurrentUser();
  const { menu, secondaryMenu } = useNavigation();
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === ROUTES.dashboard.base || ROUTES.user.base) {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href={ROUTES.base}>
                {appLogo && <Image src={appLogo} alt={appName} width={32} height={32} />}
                <span className="text-sm font-semibold">{appName}</span>
                {user?.membership?.assignedCountries && (
                  <FlagIcon
                    countryCode={user?.membership?.assignedCountries[0] as CountryCode}
                  />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menu} />
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenu?.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-icon" />
                      <span className="min-w-max mr-auto">{item.title}</span>
                      {item.badge}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
