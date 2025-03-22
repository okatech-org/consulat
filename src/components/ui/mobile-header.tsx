'use client';

import * as React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from './button';

export interface MobileHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  position?: 'fixed' | 'sticky' | 'relative';
}

const MobileHeader = React.forwardRef<HTMLElement, MobileHeaderProps>(
  (
    {
      className,
      title,
      showBackButton = true,
      onBackClick,
      rightElement,
      transparent = false,
      position = 'sticky',
      ...props
    },
    ref,
  ) => {
    const router = useRouter();

    const handleBackClick = React.useCallback(() => {
      if (onBackClick) {
        onBackClick();
      } else {
        router.back();
      }
    }, [onBackClick, router]);

    return (
      <header
        ref={ref}
        className={cn(
          'top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 pt-safe',
          position === 'fixed' && 'fixed',
          position === 'sticky' && 'sticky',
          position === 'relative' && 'relative',
          !transparent && 'bg-background border-b border-border shadow-low',
          className,
        )}
        {...props}
      >
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back"
              onClick={handleBackClick}
              className="mr-2 -ml-2"
            >
              <ChevronLeft className="size-6" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate max-w-[60vw]">{title}</h1>
        </div>
        {rightElement && <div className="flex items-center">{rightElement}</div>}
      </header>
    );
  },
);
MobileHeader.displayName = 'MobileHeader';

export { MobileHeader };
