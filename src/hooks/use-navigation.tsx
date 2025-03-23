'use client';

import { NavMainItem } from '@/components/layouts/nav-main';
import { ROUTES } from '@/schemas/routes';
import { SessionUser } from '@/types/user';
import { UserRole } from '@prisma/client';
import {
  Settings,
  LayoutDashboard,
  Globe,
  Building2,
  FileText,
  Calendar,
  User,
  Baby,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { hasAnyRole } from '@/lib/permissions/utils';

export function useNavigation(user: SessionUser) {
  const t = useTranslations('navigation.menu');
  const currentUserRoles = user.roles ?? [];
  const isAdmin = hasAnyRole(user, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.MANAGER,
    UserRole.AGENT,
  ]);

  const AdminNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t('dashboard'),
      url: ROUTES.dashboard.base,
      icon: <LayoutDashboard className="size-icon" />,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENT],
    },
    {
      title: t('countries'),
      url: ROUTES.sa.countries,
      icon: <Globe className="size-icon" />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('organizations'),
      url: ROUTES.sa.organizations,
      icon: <Building2 className="size-icon" />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('requests'),
      url: ROUTES.dashboard.requests,
      icon: <FileText className="size-icon" />,
      roles: [UserRole.ADMIN, UserRole.AGENT],
    },
    {
      title: t('appointments'),
      url: ROUTES.dashboard.appointments,
      icon: <Calendar className="size-icon" />,
      roles: [UserRole.ADMIN, UserRole.AGENT],
    },
    {
      title: t('users'),
      url: ROUTES.dashboard.users,
      icon: <Users className="size-icon" />,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('notifications'),
      url: ROUTES.dashboard.notifications,
      icon: <NotificationBell />,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER],
    },

    {
      title: t('settings'),
      url: ROUTES.dashboard.settings,
      icon: <Settings className="size-icon" />,
      roles: [UserRole.ADMIN],
    },
  ];

  const UserNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t('dashboard'),
      url: ROUTES.user.dashboard,
      icon: <LayoutDashboard className="size-icon" />,
      roles: [UserRole.USER],
    },
    {
      title: t('profile'),
      url: ROUTES.user.profile,
      icon: <User className="size-icon" />,
      roles: [UserRole.USER],
    },
    {
      title: t('children'),
      url: ROUTES.user.children,
      icon: <Baby className="size-icon" />,
      roles: [UserRole.USER],
    },
    {
      title: t('appointments'),
      url: ROUTES.user.appointments,
      icon: <Calendar className="size-icon" />,
      roles: [UserRole.USER],
    },
    {
      title: t('notifications'),
      url: ROUTES.user.notifications,
      icon: <NotificationBell />,
      roles: [UserRole.USER],
    },
  ];

  const menuItems: Array<NavMainItem & { roles: UserRole[] }> = [
    ...UserNavigation,
    ...AdminNavigation,
  ];

  const menu = menuItems.filter((item) => {
    return item.roles.some((role) => currentUserRoles.includes(role));
  });

  const mobileMenu = [
    ...menu,
    {
      title: t('account'),
      url: isAdmin ? ROUTES.dashboard.account_settings : ROUTES.user.account,
      icon: <User className="size-icon" />,
      roles: [
        UserRole.USER,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.MANAGER,
        UserRole.AGENT,
      ],
    },
    {
      title: t('feedback'),
      url: isAdmin ? ROUTES.dashboard.feedback : ROUTES.user.feedback,
      icon: <MessageSquare className="size-icon" />,
      roles: [
        UserRole.USER,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.MANAGER,
        UserRole.AGENT,
      ],
    },
  ];

  return { menu, mobileMenu };
}
