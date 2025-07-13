'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { ChatToggle } from '../chat/chat-toggle';
import { Fragment } from 'react';
import { type NavMainItem } from '@/hooks/use-navigation';
import { useCurrentUser } from '@/contexts/user-context';
import { useUserSidebarData } from '@/hooks/use-user-sidebar-data';
import { ROUTES } from '@/schemas/routes';
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
import { useTranslations } from 'next-intl';
import { CountBadge } from '../layouts/count-badge';
import { ProfileCompletionBadge } from '../layouts/profile-completion-badge';
import { UserMobileDrawer } from '../layouts/user-mobile-drawer';
import type { UserNavigationItem } from '../layouts/user-sidebar';

export interface UserBottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  showLabels?: boolean;
}

const UserBottomNavigation = React.forwardRef<HTMLElement, UserBottomNavigationProps>(
  ({ className, showLabels = true, ...props }, ref) => {
    const t = useTranslations('navigation.menu');
    const {
      data: {
        profileCompletion,
        activeRequests,
        childrenCount,
        notificationsCount,
        upcomingAppointments,
      },
    } = useUserSidebarData();

    const navigationItems: UserNavigationItem[] = [
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
        badge: <CountBadge count={activeRequests} />,
      },
      {
        title: t('appointments'),
        url: ROUTES.user.appointments,
        icon: Calendar,
        badge: <CountBadge count={upcomingAppointments} />,
      },
      {
        title: t('documents'),
        url: ROUTES.user.documents,
        icon: FolderOpen,
      },
      {
        title: t('available'),
        url: ROUTES.user.service_available,
        icon: Plus,
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
    ] as const;

    const { user: currentUser } = useCurrentUser();
    const pathname = usePathname();

    const isActive = React.useCallback(
      (href: string, exact = false) => {
        if (exact) {
          return pathname === href;
        }
        return pathname.startsWith(href);
      },
      [pathname],
    );

    const twoFirstItems = navigationItems.slice(0, 2);
    const thirdItem = navigationItems[2];

    const menu = [
      ...twoFirstItems,
      {
        title: 'Chat',
        url: '#',
        component: (
          <div className="flex relative items-center justify-center">
            <ChatToggle />
          </div>
        ),
      },
      thirdItem,
    ] as Array<NavMainItem & { component?: React.ReactNode }>;

    if (!currentUser) {
      return undefined;
    }

    return (
      <nav
        ref={ref}
        className={cn(
          'grid grid-cols-5 gap-1 py-2 px-4 md:hidden fixed bottom-0 left-0 -translate-y-4 right-0 z-50 mx-auto w-[calc(100%-2rem)] sm:max-w-max bg-background border rounded-full border-border',
          'items-center justify-around shadow-high',
          className,
        )}
        {...props}
      >
        {menu.slice(0, 4).map((item, index) => {
          if (item?.component) {
            return <Fragment key={index + item.title}>{item.component}</Fragment>;
          }
          return (
            <Link
              key={index + item?.title}
              href={item?.url ? item?.url : '#'}
              className={cn(
                'flex items-center justify-center flex-col text-center',
                'gap-1 rounded-md transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring active:scale-[0.95]',
                isActive(item?.url, true)
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )}
            >
              {item?.icon && <item.icon className="size-icon" />}
              {showLabels && (
                <span
                  className={cn('text-[9px] truncate w-full uppercase transition-all')}
                >
                  {item?.title}
                </span>
              )}
            </Link>
          );
        })}
        <div className="flex flex-col items-center justify-center">
          <UserMobileDrawer items={navigationItems} />
        </div>
      </nav>
    );
  },
);

UserBottomNavigation.displayName = 'UserBottomNavigation';

export { UserBottomNavigation };
