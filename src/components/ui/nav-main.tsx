'use client';

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
          {items.map((item, index) => (
            <SidebarMenuItem key={index + item.title}>
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
