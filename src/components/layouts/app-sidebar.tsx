'use client';

import * as React from 'react';
import {
  Badge,
  Bell,
  Building2,
  Calendar,
  FileSliders,
  FileText,
  Folder,
  GalleryVerticalEnd,
  Globe,
  LayoutDashboard,
  Settings,
  User,
  Users,
} from 'lucide-react';

import { NavMain, NavMainItem } from '@/components/layouts/nav-main';
import { NavUser } from '@/components/layouts/nav-user';
import { TeamSwitcher } from '@/components/layouts/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { FullUser } from '@/types';
import { UserRole } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/schemas/routes';
import { useNotifications } from '@/hooks/use-notifications';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: FullUser;
}) {
  const t = useTranslations('navigation');
  const t_nav = useTranslations('user.nav');
  const { unreadCount } = useNotifications();

  const AdminNavigation: NavMainItem[] = [
    {
      title: t('admin.dashboard'),
      url: ROUTES.dashboard.base,
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: t('admin.registrations'),
      url: ROUTES.dashboard.appointments,
      icon: Calendar,
    },
    {
      title: t('admin.requests'),
      url: ROUTES.dashboard.requests,
      icon: FileText,
    },
    {
      title: t('admin.settings'),
      url: ROUTES.dashboard.settings,
      icon: Settings,
    },
    {
      title: t('admin.notifications'),
      url: ROUTES.dashboard.notifications,
      iconComponent: (
        <div className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const AgentNavigation: NavMainItem[] = [
    {
      title: t('agent.dashboard'),
      url: ROUTES.dashboard.base,
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: t('agent.appointments'),
      url: ROUTES.dashboard.appointments,
      icon: Calendar,
    },
    {
      title: t('agent.requests'),
      url: ROUTES.dashboard.requests,
      icon: FileText,
    },
    {
      title: t('agent.notifications'),
      url: ROUTES.dashboard.notifications,
      iconComponent: (
        <div className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
      ),
    },
  ];

  const SuperAdminNavigation: NavMainItem[] = [
    {
      title: t('super_admin.dashboard'),
      url: ROUTES.dashboard.base,
      icon: LayoutDashboard,
    },
    {
      title: t('super_admin.countries'),
      url: ROUTES.sa.countries,
      icon: Globe,
    },
    {
      title: t('super_admin.organizations'),
      url: ROUTES.sa.organizations,
      icon: Building2,
    },
    {
      title: t('super_admin.services'),
      url: ROUTES.dashboard.services,
      icon: Settings,
    },
    {
      title: t('super_admin.users'),
      url: ROUTES.dashboard.users,
      icon: Users,
    },
    {
      title: t('super_admin.notifications'),
      url: ROUTES.dashboard.notifications,
      iconComponent: (
        <div className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  const UserNavigation: NavMainItem[] = [
    {
      title: t_nav('dashboard'),
      url: ROUTES.base,
      icon: LayoutDashboard,
    },
    {
      title: t_nav('profile'),
      url: ROUTES.user.profile,
      icon: User,
    },
    {
      title: t_nav('requests'),
      url: ROUTES.user.requests,
      icon: FileSliders,
    },
    {
      title: t_nav('appointments'),
      url: ROUTES.user.appointments,
      icon: Calendar,
    },
    {
      title: t_nav('documents'),
      url: ROUTES.user.documents,
      icon: Folder,
    },
    {
      title: t('notifications'),
      url: ROUTES.user.notifications,
      iconComponent: (
        <div className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  function getUserMenu(userRole: UserRole): NavMainItem[] {
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
        return SuperAdminNavigation;
      case UserRole.ADMIN:
        return AdminNavigation;
      case UserRole.AGENT:
        return AgentNavigation;
      case UserRole.USER:
        return UserNavigation;
      default:
        return [];
    }
  }

  const userMenu = user?.roles[0] ? getUserMenu(user.roles[0]) : [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: 'Consulat',
              logo: GalleryVerticalEnd,
              plan: user.country?.name ?? user.countryCode ?? '',
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={userMenu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: `${user.firstName} ${user.lastName}`,
            email: user.email ?? user.phone?.number ?? '',
            avatar: user.image ?? '/images/avatar-placeholder.png',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
