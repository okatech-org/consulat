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

export function IntelSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="p-4 pb-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white"
            style={{
              background:
                'linear-gradient(135deg, var(--accent-intel), var(--accent-warning))',
              animation: 'pulse-glow 3s infinite',
            }}
          >
            DG
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              DGSS
            </div>
            <div
              className="text-xs flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Consulat.ga</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
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
