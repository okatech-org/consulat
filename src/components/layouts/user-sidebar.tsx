'use client';

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { UserSidebarFooter } from './user-sidebar-footer';
import { UserSidebarHeader } from './user-sidebar-header';
import { UserSidebarNav } from './user-sidebar-nav';

export function UserSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <UserSidebarHeader />
      <SidebarContent>
        <UserSidebarNav />
      </SidebarContent>
      <UserSidebarFooter />
    </Sidebar>
  );
}
