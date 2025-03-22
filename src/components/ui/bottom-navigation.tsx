'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface BottomNavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  disabled?: boolean;
}

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: BottomNavigationItem[];
  showLabels?: boolean;
}

const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, items, showLabels = true, ...props }, ref) => {
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
          'fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full bg-background border-t border-border px-1',
          'pb-safe items-center justify-around shadow-high',
          className,
        )}
        {...props}
      >
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.disabled ? '#' : item.href}
            aria-disabled={item.disabled}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center min-h-[44px] min-w-[64px] p-2',
              'gap-1 rounded-md transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring active:scale-[0.95]',
              isActive(item.href, item.exact)
                ? 'text-primary font-medium'
                : 'text-muted-foreground',
              item.disabled && 'pointer-events-none opacity-40',
            )}
          >
            <div className="text-current">{item.icon}</div>
            {showLabels && (
              <span className={cn('text-xs mt-1 transition-all')}>{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
    );
  },
);
BottomNavigation.displayName = 'BottomNavigation';

export { BottomNavigation };
