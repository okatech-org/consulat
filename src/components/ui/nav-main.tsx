'use client';

import { MessageSquareIcon, PlusCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavMainItem } from '@/hooks/use-navigation';
import { ROUTES } from '@/schemas/routes';
import { ChatToggle } from '../chat/chat-toggle';

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === ROUTES.dashboard.base || ROUTES.user.base) {
      return pathname === url;
    }

    if (pathname === url) return true;

    pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              disabled
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Action rapide</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <ChatToggle customIcon={<MessageSquareIcon />} />
              <span className="sr-only">Messagerie</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive(item.url)}
                asChild
              >
                <Link href={item.url}>
                  {item.icon && <item.icon className="size-icon" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
