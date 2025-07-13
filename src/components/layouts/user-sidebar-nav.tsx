'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  User,
  FileText,
  Calendar,
  FolderOpen,
  Plus,
  Users,
  Bell,
  Settings,
} from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useUserSidebarData } from '@/hooks/use-user-sidebar-data';
import { ProfileCompletionBadge } from './profile-completion-badge';
import { CountBadge } from './count-badge';
import { NewBadge } from './new-badge';
import { useTranslations } from 'next-intl';

export function UserSidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('navigation.menu');
  const {
    profileCompletion,
    requestsCount,
    documentsCount,
    childrenCount,
    notificationsCount,
  } = useUserSidebarData();

  const navigationItems = [
    {
      title: t('my-space'),
      url: ROUTES.user.dashboard,
      icon: Home,
    },
    {
      title: t('profile'),
      url: ROUTES.user.profile,
      icon: User,
      badge: <ProfileCompletionBadge percentage={profileCompletion} />,
    },
    {
      title: t('services'),
      url: ROUTES.user.services,
      icon: FileText,
      badge: <CountBadge count={requestsCount} />,
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
      badge: <CountBadge count={documentsCount} />,
    },
    {
      title: t('available'),
      url: ROUTES.user.service_available,
      icon: Plus,
      badge: <NewBadge />,
    },
    {
      title: t('children'),
      url: ROUTES.user.children,
      icon: Users,
      badge: <CountBadge count={childrenCount} />,
    },
    {
      title: t('notifications'),
      url: ROUTES.user.notifications,
      icon: Bell,
      badge: <CountBadge count={notificationsCount} variant="destructive" />,
    },
    {
      title: t('settings'),
      url: ROUTES.user.account,
      icon: Settings,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url || pathname.startsWith(item.url)}
              >
                <Link href={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                  {item.badge}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
