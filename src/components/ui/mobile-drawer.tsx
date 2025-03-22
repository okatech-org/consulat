'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
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

export interface MobileDrawerItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  exact?: boolean;
  disabled?: boolean;
  children?: MobileDrawerItem[];
  divider?: boolean;
}

export interface MobileDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MobileDrawerItem[];
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
      title = 'Menu',
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

    const renderItems = (items: MobileDrawerItem[], level = 0) => {
      return items.map((item, index) => (
        <React.Fragment key={index}>
          <li className={cn(item.divider && index > 0 && 'mt-4 pt-4 border-t')}>
            <SheetClose asChild={closeTriggerOnSelect}>
              <Link
                href={item.disabled ? '#' : item.href}
                aria-disabled={item.disabled}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                    return;
                  }
                  handleItemClick();
                }}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-3 w-full transition-colors',
                  'touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'active:bg-accent/80',
                  level > 0 && 'pl-8 text-sm',
                  isActive(item.href, item.exact)
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  item.disabled && 'pointer-events-none opacity-40',
                )}
              >
                {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            </SheetClose>
            {item.children && item.children.length > 0 && (
              <ul className="mt-1 space-y-1">{renderItems(item.children, level + 1)}</ul>
            )}
          </li>
        </React.Fragment>
      ));
    };

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className={triggerClassName}
          >
            {triggerChildren || <Menu className="size-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          size="sm"
          className={cn('pt-safe flex flex-col', className)}
        >
          <SheetHeader className="text-left border-b pb-4 mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto -mx-4 px-4" ref={ref} {...props}>
            <ul className="space-y-2">{renderItems(items)}</ul>
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);
MobileDrawer.displayName = 'MobileDrawer';

export { MobileDrawer };
