'use client';

import { ChevronRight } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useTranslations } from 'next-intl';
import { Route } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavMainItem = {
  title: string;
  url: Route<string>;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: Pick<NavMainItem, 'title' | 'url'>[];
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();
  const isSubPath = (url: string) => {
    return url.split('/').length > 2;
  };
  const t = useTranslations('navigation.menu');

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('title')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Fragment key={item.title}>
            {item?.items ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size="md"
                      tooltip={item.title}
                      isActive={item.isActive}
                    >
                      {item.icon}
                      <span className={item.icon ? '-ml-1' : ''}>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton size="md" asChild>
                            <Link prefetch={true} href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="md"
                  tooltip={item.title}
                  asChild
                  isActive={
                    isSubPath(item.url)
                      ? pathname.startsWith(item.url)
                      : pathname === item.url
                  }
                >
                  <Link prefetch={true} href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
