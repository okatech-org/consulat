'use client';

import { ROUTES } from '@/schemas/routes';
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
import { useCurrentUser } from './use-current-user';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { UserRole } from '@/convex/lib/constants';

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
  const { user } = useCurrentUser();
  const unreadNotifications = useQuery(
    api.functions.notification.getUnreadNotifications,
    user ? { userId: user._id } : 'skip',
  );

  const AdminNavigation: Array<NavMainItem & { roles: UserRole[] }> = [
    {
      title: t('dashboard'),
      url: ROUTES.dashboard.base,
      icon: LayoutDashboard,
      roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Manager],
    },
    {
      title: t('countries'),
      url: ROUTES.sa.countries,
      icon: Globe,
      roles: [UserRole.SuperAdmin],
    },
    {
      title: t('organizations'),
      url: ROUTES.sa.organizations,
      icon: Building2,
      roles: [UserRole.SuperAdmin],
    },
    {
      title: t('users'),
      url: ROUTES.sa.users,
      icon: Users,
      roles: [UserRole.SuperAdmin],
    },
    {
      title: t('requests'),
      url: ROUTES.dashboard.requests,
      icon: FolderIcon,
      roles: [UserRole.Admin, UserRole.Agent, UserRole.SuperAdmin, UserRole.Manager],
    },
    {
      title: t('profiles'),
      url: ROUTES.dashboard.profiles,
      icon: Users,
      roles: [UserRole.Admin, UserRole.Agent, UserRole.SuperAdmin, UserRole.Manager],
    },
    {
      title: t('child-profiles'),
      url: ROUTES.dashboard.child_profiles,
      icon: Users,
      roles: [UserRole.Admin, UserRole.Agent, UserRole.SuperAdmin, UserRole.Manager],
    },
    {
      title: t('appointments'),
      url: ROUTES.dashboard.appointments,
      icon: Calendar,
      roles: [UserRole.Admin, UserRole.Agent, UserRole.Manager],
    },
    {
      title: t('services'),
      url: ROUTES.dashboard.services,
      icon: FileText,
      roles: [UserRole.Admin, UserRole.SuperAdmin],
    },
    {
      title: t('agents'),
      url: ROUTES.dashboard.agents,
      icon: Users,
      roles: [UserRole.Admin, UserRole.Manager, UserRole.SuperAdmin],
    },
    {
      title: t('tickets'),
      url: ROUTES.dashboard.tickets,
      icon: Ticket,
      roles: [UserRole.SuperAdmin],
    },
    {
      title: t('dashboard'),
      url: ROUTES.intel.base,
      icon: LayoutDashboard,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-profiles'),
      url: ROUTES.intel.profiles,
      icon: Users,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-notes'),
      url: ROUTES.intel.notes,
      icon: FileText,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-map'),
      url: ROUTES.intel.map,
      icon: MapPin,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-competences'),
      url: ROUTES.intel.competences,
      icon: BookOpen,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-associations'),
      url: ROUTES.intel.associations,
      icon: Building2,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-reports'),
      url: ROUTES.intel.reports,
      icon: FileText,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-analytics'),
      url: ROUTES.intel.analytics,
      icon: BarChart3,
      roles: [UserRole.IntelAgent],
    },
    {
      title: t('intel-predictions'),
      url: ROUTES.intel.predictions,
      icon: Brain,
      roles: [UserRole.IntelAgent],
    },
  ];

  const secondaryMenu: NavMainItem[] = [
    {
      title: t('notifications'),
      url: ROUTES.dashboard.notifications,
      icon: Bell,
      badge: (
        <CountBadge count={unreadNotifications?.length ?? 0} variant="destructive" />
      ),
      roles: [UserRole.Admin, UserRole.Agent, UserRole.Manager, UserRole.IntelAgent],
    },
    {
      title: t('settings'),
      url: ROUTES.dashboard.settings,
      icon: Settings,
      roles: [UserRole.Admin, UserRole.Agent, UserRole.Manager],
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
        UserRole.User,
        UserRole.Admin,
        UserRole.SuperAdmin,
        UserRole.Manager,
        UserRole.Agent,
        UserRole.IntelAgent,
      ],
    },
    {
      title: t('feedback'),
      url: ROUTES.dashboard.feedback,
      icon: MessageSquare,
      roles: [
        UserRole.User,
        UserRole.Admin,
        UserRole.SuperAdmin,
        UserRole.Manager,
        UserRole.Agent,
        UserRole.IntelAgent,
      ],
    },
    ...secondaryMenu,
  ];

  return { menu, mobileMenu, secondaryMenu };
}

export function useUserNavigation() {
  const { user } = useCurrentUser();
  const t = useTranslations('navigation.menu');
  const unreadNotifications = useQuery(
    api.functions.notification.getUnreadNotifications,
    user ? { userId: user._id } : 'skip',
  );
  if (!user) return { menu: [], mobileMenu: [] };

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
        <CountBadge count={unreadNotifications?.length ?? 0} variant="destructive" />
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
