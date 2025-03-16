'use client';

import * as React from 'react';
import {
  Building2,
  Calendar,
  FileText,
  Globe,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Baby,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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
import { NotificationBell } from '../notifications/notification-bell';
import { CountryCode } from '@/lib/autocomplete-datas';

const logo =
  process.env.NEXT_PUBLIC_LOGO_URL ||
  'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvzLokCdOyRlrM9oTwuD7FqvYPzsEJWIQGeR1Vx';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: FullUser;
}) {
  const t = useTranslations('navigation');
  const t_nav = useTranslations('user.nav');
  const t_countries = useTranslations('countries');
  const currentUserRoles = user.roles;

  const AdminNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t('super_admin.dashboard'),
      url: ROUTES.dashboard.base,
      icon: LayoutDashboard,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENT],
    },
    {
      title: t('super_admin.countries'),
      url: ROUTES.sa.countries,
      icon: Globe,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('super_admin.organizations'),
      url: ROUTES.sa.organizations,
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('admin.requests'),
      url: ROUTES.dashboard.requests,
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.AGENT],
    },
    {
      title: t('super_admin.users'),
      url: ROUTES.dashboard.users,
      icon: Users,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    },
    {
      title: t('admin.notifications'),
      url: ROUTES.dashboard.notifications,
      iconComponent: <NotificationBell />,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENT],
    },

    {
      title: t('admin.settings'),
      url: ROUTES.dashboard.settings,
      icon: Settings,
      roles: [UserRole.ADMIN],
    },
  ];

  const UserNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t_nav('dashboard'),
      url: ROUTES.user.dashboard,
      icon: LayoutDashboard,
      roles: [UserRole.USER],
    },
    {
      title: t_nav('profile'),
      url: ROUTES.user.profile,
      icon: User,
      roles: [UserRole.USER],
    },
    {
      title: t_nav('children'),
      url: ROUTES.user.children,
      icon: Baby,
      roles: [UserRole.USER],
    },
    {
      title: t_nav('appointments'),
      url: ROUTES.user.appointments,
      icon: Calendar,
      roles: [UserRole.USER],
    },
    {
      title: t('notifications'),
      url: ROUTES.user.notifications,
      iconComponent: <NotificationBell />,
      roles: [UserRole.USER],
    },
  ];

  const menuItems: Array<NavMainItem & { roles: UserRole[] }> = [
    ...UserNavigation,
    ...AdminNavigation,
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles.some((role) => currentUserRoles.includes(role));
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: (
                <span className="flex items-center gap-2">
                  <span>Consulat</span>
                </span>
              ),
              logo: (
                <Link
                  href={ROUTES.base}
                  className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-white">
                    <Image
                      src={logo}
                      width={60}
                      height={60}
                      alt="Consulat.ga"
                      className="relative h-7 w-7 rounded-md transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              ),
              plan: user.countryCode && (
                <span className="flex items-center gap-2">
                  {user.countryCode && t_countries(user.countryCode as CountryCode)}
                </span>
              ),
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredMenuItems} />
      </SidebarContent>
      <SidebarFooter className="py-6">
        <NavUser
          user={{
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName.charAt(0)}`
                : ' - ',
            email: user.email ?? user.phone?.number ?? '',
            avatar: user.image ?? '/images/avatar-placeholder.png',
            roles: currentUserRoles,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
