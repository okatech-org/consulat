'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { UserSidebarNav } from './user-sidebar-nav';
import { UserSidebarFooter } from './user-sidebar-footer';
import { UserSidebarHeader } from './user-sidebar-header';

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
