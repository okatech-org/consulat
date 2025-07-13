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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserNavigationData } from '@/hooks/use-user-navigation-data';
import { Skeleton } from '@/components/ui/skeleton';

export interface NavMainItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  badge?: {
    type: 'count' | 'percentage' | 'text';
    value: number | string;
    variant?: 'default' | 'secondary' | 'destructive' | 'success';
  };
  items?: {
    title: string;
    url: string;
  }[];
}

interface NavMainProps {
  items: NavMainItem[];
}

export function NavMainEnhanced({ items }: NavMainProps) {
  const pathname = usePathname();
  const { data: navData, loading } = useUserNavigationData();

  const getEnhancedItems = (): NavMainItem[] => {
    return items.map((item) => {
      // Add badges based on navigation data
      let badge = item.badge;

      if (item.url.includes('/profile')) {
        badge = {
          type: 'percentage',
          value: navData.profileCompletion,
          variant:
            navData.profileCompletion >= 90
              ? 'success'
              : navData.profileCompletion >= 50
                ? 'default'
                : 'destructive',
        };
      } else if (item.url.includes('/services/requests') && navData.activeRequests > 0) {
        badge = {
          type: 'count',
          value: navData.activeRequests,
          variant: 'destructive',
        };
      } else if (item.url.includes('/documents') && navData.documentsCount > 0) {
        badge = {
          type: 'count',
          value: navData.documentsCount,
          variant: 'secondary',
        };
      } else if (item.url.includes('/children') && navData.childrenCount > 0) {
        badge = {
          type: 'count',
          value: navData.childrenCount,
          variant: 'secondary',
        };
      } else if (
        item.url.includes('/services/new') ||
        (item.url.includes('/services') && !item.url.includes('/requests'))
      ) {
        badge = {
          type: 'text',
          value: 'Nouveau',
          variant: 'success',
        };
      } else if (item.url.includes('/notifications') && navData.notificationsCount > 0) {
        badge = {
          type: 'count',
          value: navData.notificationsCount,
          variant: 'destructive',
        };
      }

      return { ...item, badge };
    });
  };

  const enhancedItems = getEnhancedItems();

  const renderBadge = (badge: NavMainItem['badge']) => {
    if (!badge) return null;

    if (loading) {
      return <Skeleton className="h-5 w-8 rounded" />;
    }

    if (badge.type === 'percentage') {
      return (
        <div className="ml-auto">
          <Badge
            variant={badge.variant === 'success' ? 'default' : badge.variant || 'default'}
            className={cn(
              'text-xs font-semibold min-w-[3rem] justify-center',
              badge.variant === 'success' && 'bg-green-500 text-white',
              badge.variant === 'destructive' && 'bg-red-500 text-white',
            )}
          >
            {badge.value}%
          </Badge>
        </div>
      );
    }

    if (badge.type === 'count' && Number(badge.value) > 0) {
      return (
        <SidebarMenuBadge
          className={cn(
            'bg-red-500 text-white text-xs font-semibold',
            badge.variant === 'secondary' && 'bg-gray-500',
            badge.variant === 'success' && 'bg-green-500',
          )}
        >
          {badge.value}
        </SidebarMenuBadge>
      );
    }

    if (badge.type === 'text') {
      return (
        <div className="ml-auto">
          <Badge
            variant={badge.variant === 'success' ? 'default' : badge.variant || 'default'}
            className={cn(
              'text-xs font-semibold',
              badge.variant === 'success' && 'bg-green-500 text-white',
            )}
          >
            {badge.value}
          </Badge>
        </div>
      );
    }

    return null;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
      <SidebarMenu>
        {enhancedItems.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

          return (
            <SidebarMenuItem key={item.title}>
              {item.items ? (
                <Collapsible asChild>
                  <div>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {renderBadge(item.badge)}
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {renderBadge(item.badge)}
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
