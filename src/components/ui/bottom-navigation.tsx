'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/use-navigation';
import { SessionUser } from '@/types/user';
import { MobileDrawer } from './mobile-drawer';

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

    return (
      <nav
        ref={ref}
        className={cn(
          'flex md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 w-full bg-background border-t border-border px-1',
          'items-center justify-around shadow-high',
          className,
        )}
        {...props}
      >
        {mobileMenu.slice(0, 4).map((item, index) => (
          <Link
            key={index}
            href={item.url ? item.url : '#'}
            className={cn(
              'flex flex-col items-center justify-center min-h-[44px] min-w-[64px] p-2',
              'gap-1 rounded-md transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring active:scale-[0.95]',
              isActive(item.url, true)
                ? 'text-primary font-medium'
                : 'text-muted-foreground',
            )}
          >
            <div className="text-current">{item.icon}</div>
            {showLabels && (
              <span className={cn('text-[8px] text-uppercase transition-all')}>
                {item.title}
              </span>
            )}
          </Link>
        ))}
        <MobileDrawer items={mobileMenu} />
      </nav>
    );
  },
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
