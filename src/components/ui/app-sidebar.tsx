'use client';

import * as React from 'react';

import { NavMainEnhanced } from '@/components/ui/nav-main-enhanced';
import { NavUser } from '@/components/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { env } from '@/env';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/contexts/user-context';
import type { CountryCode } from '@/lib/autocomplete-datas';
import { FlagIcon } from './flag-icon';
import { useNavigation } from '@/hooks/use-navigation';
import type { SessionUser } from '@/types/user';
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appName = env.NEXT_PUBLIC_APP_NAME;
  const appLogo = env.NEXT_PUBLIC_ORG_LOGO;
  const { user: currentUser } = useCurrentUser();
  const { menu } = useNavigation(currentUser as SessionUser);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href={ROUTES.base}>
                {appLogo && <Image src={appLogo} alt={appName} width={32} height={32} />}
                <span className="text-sm font-semibold">{appName}</span>
                {currentUser?.countryCode && (
                  <FlagIcon countryCode={currentUser?.countryCode as CountryCode} />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainEnhanced items={menu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
