'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Component to add global styles for hiding scrollbars
const ScrollbarStylesProvider = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  // Debug in dev mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Tabs isMobile:', isMobile);
    }
  }, [isMobile]);

  return (
    <>
      {isMobile && <ScrollbarStylesProvider />}
      {isMobile ? (
        <TabsListMobile ref={ref} className={cn(className)} {...props} />
      ) : (
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
            className,
          )}
          {...props}
        />
      )}
    </>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsListMobile = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex w-full flex-nowrap overflow-x-auto snap-x snap-mandatory px-1 py-2',
      'scrollbar-none gap-2 rounded-lg bg-muted text-muted-foreground',
      'touch-manipulation no-scrollbar',
      className,
    )}
    {...props}
  />
));
TabsListMobile.displayName = 'TabsListMobile';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md',
        'transition-all touch-manipulation',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isMobile
          ? 'min-h-[44px] min-w-[44px] px-4 py-2 text-base shadow-low snap-center flex-shrink-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-medium active:scale-[0.98]'
          : 'px-3 py-1.5 text-sm font-medium h-8 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'animate-fade-in w-full',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsListMobile, TabsTrigger, TabsContent };
