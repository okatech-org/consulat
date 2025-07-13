'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '../ui/sheet';

import { ThemeToggleSingle } from '../layouts/theme-toggle-single';
import { NotificationBell } from '../notifications/notification-bell';
import { LogoutButton } from '../ui/logout-button';
import type { UserNavigationItem } from './user-sidebar';

export interface UserMobileDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  items: UserNavigationItem[];
  title?: string;
  triggerClassName?: string;
  closeTriggerOnSelect?: boolean;
}

const UserMobileDrawer = React.forwardRef<HTMLDivElement, UserMobileDrawerProps>(
  (
    {
      className,
      items,
      title = 'Menu principal',
      triggerClassName,
      closeTriggerOnSelect = true,
      ...props
    },
    ref,
  ) => {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    const isActive = React.useCallback(
      (href: string, exact: boolean = false) => {
        if (exact) {
          return pathname === href;
        }
        return pathname.startsWith(href);
      },
      [pathname],
    );

    const handleItemClick = () => {
      if (closeTriggerOnSelect) {
        setOpen(false);
      }
    };

    const renderItems = (items: UserNavigationItem[], level = 0) => {
      return items.map((item, index) => (
        <React.Fragment key={index}>
          <div className={cn(index > 0 && 'border-b')}>
            <SheetClose asChild={closeTriggerOnSelect}>
              <Link
                href={item.url ? item.url : '#'}
                onClick={handleItemClick}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-3 w-full transition-colors',
                  'touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'active:bg-accent/80',
                  level > 0 && 'pl-8 text-sm',
                  isActive(item.url, true)
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.icon && <item.icon className="size-icon" />}
                <span className="min-w-max mr-auto">{item.title}</span>
                {item.badge}
              </Link>
            </SheetClose>
          </div>
        </React.Fragment>
      ));
    };

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ouvrir le menu"
            className={cn(
              triggerClassName,
              'flex flex-col items-center justify-center gap-0',
            )}
          >
            <div className="flex flex-col items-center justify-center gap-0">
              <Menu className="size-icon" />
              <span className="text-[10px] uppercase text-muted-foreground">Menu</span>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className={cn('flex flex-col max-h-[70dvh]', className)}
        >
          <SheetHeader className="text-left border-b pb-4 mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-auto -mx-4 px-4 space-y-2" ref={ref} {...props}>
            {renderItems(items)}
          </nav>
          <div className="flex w-full items-center justify-between pt-4">
            <LogoutButton />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggleSingle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

UserMobileDrawer.displayName = 'UserMobileDrawer';

export { UserMobileDrawer };
