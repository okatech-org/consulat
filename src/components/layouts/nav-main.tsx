'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

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

export type NavMainItem = {
  title: string;
  url: Route<string>;
  icon?: LucideIcon;
  isActive?: boolean;
  iconComponent?: React.ReactNode;
  items?: Pick<NavMainItem, 'title' | 'url'>[];
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  const t = useTranslations('navigation');
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('menu')}</SidebarGroupLabel>
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
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      {item.iconComponent && item.iconComponent}
                      <span className={item.iconComponent ? '-ml-2' : ''}>
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    {item.iconComponent && item.iconComponent}
                    <span className={item.iconComponent ? '-ml-2' : ''}>
                      {item.title}
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
