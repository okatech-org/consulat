'use client';

import * as React from 'react';

import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: React.ReactNode;
    logo: React.ReactNode;
    plan: React.ReactNode;
  }[];
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square items-center justify-center rounded-md">
              {teams[0] && teams[0].logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <p className="truncate font-semibold">{teams[0]?.name}</p>
              <span className="truncate text-xs">{teams[0]?.plan}</span>
            </div>
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
