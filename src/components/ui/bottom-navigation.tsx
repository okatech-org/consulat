'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/use-navigation';
import { SessionUser } from '@/types/user';
import { MobileDrawer } from './mobile-drawer';
import { ChatToggle } from '../chat/chat-toggle';
import { NavMainItem } from '../layouts/nav-main';
import { Fragment } from 'react';

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  user: SessionUser;
  showLabels?: boolean;
}

const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, showLabels = true, user, ...props }, ref) => {
    const { mobileMenu } = useNavigation(user);
    const pathname = usePathname();

    const isActive = React.useCallback(
      (href: string, exact: boolean = false) => {
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
          <div className="flex aspect-square p-2 items-center justify-center">
            <ChatToggle />
          </div>
        ),
      },
      thirdItem,
    ] as NavMainItem[];

    return (
      <nav
        ref={ref}
        className={cn(
          'grid grid-cols-5 md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 min-h-max w-full bg-background border-t border-border',
          'items-center justify-around shadow-high',
          className,
        )}
        {...props}
      >
        {menu.slice(0, 4).map((item, index) => {
          if (item.component) {
            return <Fragment key={index + item.title}>{item.component}</Fragment>;
          }
          return (
            <Link
              key={index + item.title}
              href={item.url ? item.url : '#'}
              className={cn(
                'flex items-center justify-center flex-col text-center aspect-square',
                'gap-1 rounded-md transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring active:scale-[0.95]',
                isActive(item.url, true)
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <div className="text-current">{item.icon}</div>
              {showLabels && (
                <span
                  className={cn(
                    'text-[8px] truncate w-full text-uppercase transition-all',
                  )}
                >
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
        <div className="flex aspect-square items-center justify-center">
          <MobileDrawer items={mobileMenu} />
        </div>
      </nav>
    );
  },
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
