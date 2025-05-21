'use client';

import * as React from 'react';
import { NavMain } from '@/components/layouts/nav-main';
import { NavUser } from '@/components/layouts/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SessionUser } from '@/types/user';
import { useNavigation } from '@/hooks/use-navigation';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SessionUser;
}) {
  const { menu } = useNavigation(user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="pt-16">
        <NavMain items={menu} />
      </SidebarContent>
      <SidebarFooter className="py-4">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
