'use client';

import { ROUTES } from '@/schemas/routes';
import type { SessionUser } from '@/types/user';
import { UserRole } from '@prisma/client';
import {
  Settings,
  LayoutDashboard,
  Globe,
  Building2,
  FileText,
  Calendar,
  User,
  Users,
  MessageSquare,
  FolderIcon,
  FileIcon,
  Home,
  Bell,
  type LucideIcon,
  FolderOpen,
  MailIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasAnyRole } from '@/lib/permissions/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CountBadge } from '@/components/layouts/count-badge';
import { ProfileCompletionBadge } from '@/components/layouts/profile-completion-badge';
import { useUserSidebarData } from './use-user-sidebar-data';

export type NavMainItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
};

export type UserNavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  items?: UserNavigationItem[];
};

export function useNavigation(user: SessionUser) {
  const t = useTranslations('navigation.menu');
  const currentUserRoles = user?.roles ?? [];
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
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
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
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN],
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
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      title: t('settings'),
      url: ROUTES.dashboard.settings,
      icon: Settings,
      roles: [UserRole.ADMIN],
    },
  ];

  const menuItems: Array<NavMainItem & { roles: UserRole[] }> = [...AdminNavigation];

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

export function useUserNavigation() {
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

  const userNavigationItems: UserNavigationItem[] = [
    {
      title: t('my-space'),
      url: ROUTES.user.dashboard,
      icon: Home,
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
      title: t('my_requests'),
      url: ROUTES.user.requests,
      icon: FileText,
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
    {
      title: t('contact'),
      url: ROUTES.user.contact,
      icon: MailIcon,
    },
  ] as const;

  const userSecondaryNavItems: UserNavigationItem[] = [
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

  return {
    menu: userNavigationItems,
    secondaryMenu: userSecondaryNavItems,
    mobileMenu: [...userNavigationItems, ...userSecondaryNavItems],
  };
}
