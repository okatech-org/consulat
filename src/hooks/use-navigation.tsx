'use client';

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
  FolderIcon,
  FileIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasAnyRole } from '@/lib/permissions/utils';

export type NavMainItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
};

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
      icon: LayoutDashboard,
      roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER],
    },
    {
      title: t('countries'),
      url: ROUTES.sa.countries,
      icon: Globe,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('organizations'),
      url: ROUTES.sa.organizations,
      icon: Building2,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('requests'),
      url: ROUTES.dashboard.requests,
      icon: FolderIcon,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('services'),
      url: ROUTES.dashboard.services,
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('profiles'),
      url: ROUTES.dashboard.profiles,
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('agents'),
      url: ROUTES.dashboard.agents,
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: t('appointments'),
      url: ROUTES.dashboard.appointments,
      icon: Calendar,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('users'),
      url: ROUTES.dashboard.users,
      icon: Users,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('document-templates'),
      url: ROUTES.dashboard.doc_templates,
      icon: FileIcon,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('settings'),
      url: ROUTES.dashboard.settings,
      icon: Settings,
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    },
  ];

  const UserNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t('dashboard'),
      url: ROUTES.user.dashboard,
      icon: LayoutDashboard,
      roles: [UserRole.USER],
    },
    {
      title: t('profile'),
      url: ROUTES.user.profile,
      icon: User,
      roles: [UserRole.USER],
    },
    {
      title: t('services'),
      url: ROUTES.user.services,
      icon: FolderIcon,
      roles: [UserRole.USER],
    },
    {
      title: t('children'),
      url: ROUTES.user.children,
      icon: Baby,
      roles: [UserRole.USER],
    },
    {
      title: t('appointments'),
      url: ROUTES.user.appointments,
      icon: Calendar,
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
      icon: User,
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
      icon: MessageSquare,
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
