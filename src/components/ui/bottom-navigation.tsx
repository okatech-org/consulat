'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/use-navigation';
import { MobileDrawer } from './mobile-drawer';
import { ChatToggle } from '../chat/chat-toggle';
import { Fragment } from 'react';
import { type NavMainItem } from '@/hooks/use-navigation';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  showLabels?: boolean;
}

const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, showLabels = true, ...props }, ref) => {
    const { user: currentUser } = useCurrentUser();
    const { mobileMenu } = useNavigation(currentUser!);
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

    const twoFirstItems = mobileMenu.slice(0, 2);
    const thirdItem = mobileMenu[2];

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
          'grid grid-cols-5 gap-1 py-2 md:hidden fixed bottom-0 left-0 -translate-y-4 right-0 z-50 mx-auto w-[calc(100%-2rem)] sm:max-w-max bg-background border rounded-full border-border',
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
          <MobileDrawer items={mobileMenu} />
        </div>
      </nav>
    );
  },
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
