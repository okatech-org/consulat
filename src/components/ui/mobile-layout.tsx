'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { MobileHeader, MobileHeaderProps } from './mobile-header';
import { BottomNavigation, BottomNavigationProps } from './bottom-navigation';

export interface MobileLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  headerProps?: Omit<MobileHeaderProps, 'ref' | 'className'>;
  navigationProps?: Omit<BottomNavigationProps, 'ref' | 'className'>;
  showHeader?: boolean;
  showNavigation?: boolean;
  fullHeight?: boolean;
}

const MobileLayout = React.forwardRef<HTMLDivElement, MobileLayoutProps>(
  (
    {
      className,
      children,
      headerProps,
      navigationProps,
      showHeader = true,
      showNavigation = true,
      fullHeight = true,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', fullHeight && 'min-h-[100dvh]', className)}
        {...props}
      >
        {showHeader && headerProps && <MobileHeader {...headerProps} />}

        <main
          className={cn(
            'flex-1 overflow-auto pb-safe',
            showNavigation && 'pb-[calc(4rem+env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </main>

        {showNavigation && navigationProps && <BottomNavigation {...navigationProps} />}
      </div>
    );
  },
);
MobileLayout.displayName = 'MobileLayout';

export { MobileLayout };
