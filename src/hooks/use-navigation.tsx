'use client';

import { ROUTES } from '@/schemas/routes';
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
  Ticket,
  MapPin,
  BarChart3,
  Brain,
  BookOpen,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasAnyRole } from '@/lib/permissions/utils';
import { CountBadge } from '@/components/layouts/count-badge';
import { useRoleData } from './use-role-data';
import type {
  AgentData,
  AdminData,
  ManagerData,
  IntelAgentData,
} from '@/types/role-data';
import { api } from '@/trpc/react';

export type NavMainItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: React.ReactNode;
};

export type UserNavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  items?: UserNavigationItem[];
};

export function useNavigation() {
  const t = useTranslations('navigation.menu');
  const roleData = useRoleData<AdminData | ManagerData | AgentData | IntelAgentData>();
  if (!roleData) return { menu: [], mobileMenu: [] };
  const user = roleData?.user;
  const stats = roleData?.stats;

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
      title: t('users'),
      url: ROUTES.sa.users,
      icon: Users,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('requests'),
      url: ROUTES.dashboard.requests,
      icon: FolderIcon,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('profiles'),
      url: ROUTES.dashboard.profiles,
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    },
    {
      title: t('appointments'),
      url: ROUTES.dashboard.appointments,
      icon: Calendar,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER],
    },
    {
      title: t('services'),
      url: ROUTES.dashboard.services,
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      title: t('agents'),
      url: ROUTES.dashboard.agents,
      icon: Users,
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN],
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
      title: t('tickets'),
      url: ROUTES.dashboard.tickets,
      icon: Ticket,
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      title: t('dashboard'),
      url: ROUTES.intel.base,
      icon: LayoutDashboard,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-profiles'),
      url: ROUTES.intel.profiles,
      icon: Users,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-notes'),
      url: ROUTES.intel.notes,
      icon: FileText,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-map'),
      url: ROUTES.intel.map,
      icon: MapPin,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-competences'),
      url: ROUTES.intel.competences,
      icon: BookOpen,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-associations'),
      url: ROUTES.intel.associations,
      icon: Building2,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-reports'),
      url: ROUTES.intel.reports,
      icon: FileText,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-analytics'),
      url: ROUTES.intel.analytics,
      icon: BarChart3,
      roles: [UserRole.INTEL_AGENT],
    },
    {
      title: t('intel-predictions'),
      url: ROUTES.intel.predictions,
      icon: Brain,
      roles: [UserRole.INTEL_AGENT],
    },
  ];

  const secondaryMenu: NavMainItem[] = [
    {
      title: t('notifications'),
      url: ROUTES.dashboard.notifications,
      icon: Bell,
      badge: <CountBadge count={stats?.unreadNotifications ?? 0} variant="destructive" />,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER, UserRole.INTEL_AGENT],
    },
    {
      title: t('settings'),
      url: ROUTES.user.settings,
      icon: Settings,
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER, UserRole.INTEL_AGENT],
    },
  ] as const;

  const menuItems: Array<NavMainItem & { roles: UserRole[] }> = [...AdminNavigation];

  const menu = menuItems.filter((item) => {
    return hasAnyRole(user, item.roles);
  });

  const mobileMenu = [
    ...menu,
    {
      title: t('account'),
      url: ROUTES.dashboard.account_settings,
      icon: User,
      roles: [
        UserRole.USER,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.MANAGER,
        UserRole.AGENT,
        UserRole.INTEL_AGENT,
      ],
    },
    {
      title: t('feedback'),
      url: ROUTES.dashboard.feedback,
      icon: MessageSquare,
      roles: [
        UserRole.USER,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.MANAGER,
        UserRole.AGENT,
        UserRole.INTEL_AGENT,
      ],
    },
    ...secondaryMenu,
  ];

  return { menu, mobileMenu, secondaryMenu };
}

export function useUserNavigation() {
  const t = useTranslations('navigation.menu');
  const { data: unreadNotifications } = api.notifications.getUnreadCount.useQuery();

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
    },
    {
      title: t('appointments'),
      url: ROUTES.user.appointments,
      icon: Calendar,
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
      badge: unreadNotifications ? (
        <CountBadge count={unreadNotifications} variant="destructive" />
      ) : undefined,
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
