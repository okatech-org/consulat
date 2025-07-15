'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/schemas/routes';
import {
  Bell,
  Calendar,
  FileText,
  FolderOpen,
  Home,
  Plus,
  Settings,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { NavUser } from '../ui/nav-user';
import { useUserSidebarData } from '@/hooks/use-user-sidebar-data';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { CountBadge } from './count-badge';
import { ProfileCompletionBadge } from './profile-completion-badge';
import { Skeleton } from '../ui/skeleton';

export type UserNavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  items?: UserNavigationItem[];
};

export function UserSidebar() {
  const pathname = usePathname();
  const t = useTranslations('navigation.menu');
  const {
    data: {
      profileCompletion,
      activeRequests,
      childrenCount,
      notificationsCount,
      upcomingAppointments,
    },
    loading,
  } = useUserSidebarData();

  const navigationItems: UserNavigationItem[] = [
    {
      title: t('my-space'),
      url: ROUTES.user.dashboard,
      icon: Home,
    },
    {
      title: t('my_requests'),
      url: ROUTES.user.requests,
      icon: FileText,
    },
    {
      title: t('profile'),
      url: ROUTES.user.profile,
      icon: User,
      badge: loading ? (
        <Skeleton className="h-4 w-4" />
      ) : (
        <ProfileCompletionBadge percentage={profileCompletion} />
      ),
    },
    {
      title: t('services'),
      url: ROUTES.user.services,
      icon: FileText,
      badge: loading ? (
        <Skeleton className="h-4 w-4" />
      ) : (
        <CountBadge count={activeRequests} />
      ),
    },
    {
      title: t('appointments'),
      url: ROUTES.user.appointments,
      icon: Calendar,
      badge: loading ? (
        <Skeleton className="h-4 w-4" />
      ) : (
        <CountBadge count={upcomingAppointments} />
      ),
    },
    {
      title: t('documents'),
      url: ROUTES.user.documents,
      icon: FolderOpen,
    },
    {
      title: t('children'),
      url: ROUTES.user.children,
      icon: Users,
      badge: loading ? (
        <Skeleton className="h-4 w-4" />
      ) : (
        <CountBadge count={childrenCount} />
      ),
    },
  ] as const;
  const secondaryNavItems: UserNavigationItem[] = [
    {
      title: t('notifications'),
      url: ROUTES.user.notifications,
      icon: Bell,
      badge: <CountBadge count={notificationsCount} variant="destructive" />,
    },
    {
      title: t('settings'),
      url: ROUTES.user.settings,
      icon: Settings,
    },
  ] as const;

  const isActive = (url: string) => {
    if (url === ROUTES.dashboard.base || ROUTES.user.base) {
      return pathname === url;
    }

    if (pathname === url) return true;

    pathname.startsWith(url);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.user.dashboard}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Mon espace</span>
                  <span className="truncate text-xs">Consulat.ga</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-icon" />
                      <span className="min-w-max mr-auto">{item.title}</span>
                      {item.badge}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="size-icon" />
                      <span className="min-w-max mr-auto">{item.title}</span>
                      {item.badge}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
