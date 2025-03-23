'use client';

import * as React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from './sheet';

import { NavMainItem } from '../layouts/nav-main';
import { ThemeToggleSingle } from '../layouts/theme-toggle-single';
import { logUserOut } from '@/actions/auth';

export interface MobileDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavMainItem[];
  title?: string;
  triggerClassName?: string;
  triggerChildren?: React.ReactNode;
  closeTriggerOnSelect?: boolean;
}

const MobileDrawer = React.forwardRef<HTMLDivElement, MobileDrawerProps>(
  (
    {
      className,
      items,
      title = 'Menu principal',
      triggerClassName,
      triggerChildren,
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

    const renderItems = (items: NavMainItem[], level = 0) => {
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
                {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                <span>{item.title}</span>
              </Link>
            </SheetClose>
            {item.items && item.items.length > 0 && (
              <ul className="mt-1 space-y-1">{renderItems(item.items, level + 1)}</ul>
            )}
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
            className={triggerClassName}
          >
            {triggerChildren || <Menu className="size-icon" />}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          size="sm"
          className={cn('flex flex-col max-h-[70dvh]', className)}
        >
          <SheetHeader className="text-left border-b pb-4 mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-auto -mx-4 px-4 space-y-2" ref={ref} {...props}>
            {renderItems(items)}
          </nav>
          <div className="flex w-full items-center justify-between pt-4">
            <ThemeToggleSingle />
            <Button
              variant="ghost"
              onClick={async () => {
                await logUserOut();
              }}
            >
              <LogOut className="size-icon" />
              {'Se déconnecter'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);
MobileDrawer.displayName = 'MobileDrawer';

export { MobileDrawer };
