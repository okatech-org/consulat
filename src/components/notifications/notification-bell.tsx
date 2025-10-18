'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SheetTrigger, SheetContent, SheetHeader, SheetTitle, Sheet } from '../ui/sheet';
import { NotificationsListing } from './notifications-listing';
import { useIsMobile } from '@/hooks/use-mobile';
import { BellRingIcon } from 'lucide-react';

interface NotificationBellProps {
  title?: string;
  className?: string;
  bellClassName?: string;
  badgeClassName?: string;
}

export function NotificationBell({
  title = 'Notifications',
  className,
  bellClassName,
}: NotificationBellProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn('relative inline-block', className)}>
      <Sheet>
        <SheetTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-label={title}
            tabIndex={0}
            className="rounded-full relative aspect-square hover:bg-muted transition-colors"
          >
            <BellRingIcon
              className={`${bellClassName} size-5 animate-[bell-ring_0.5s_ease-in-out]`}
            />

            <AnimatePresence>
              <div className="absolute aspect-square size-2 bg-red-500 rounded-full top-[-100%] translate-x-[1rem] translate-y-[1rem]">
                <span className="sr-only">{0}</span>
              </div>
            </AnimatePresence>
          </motion.div>
        </SheetTrigger>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={cn(
            'flex flex-col w-full !max-w-[700px] overflow-y-auto h-full',
            isMobile && 'max-h-[70dvh]',
          )}
        >
          <SheetHeader className="text-left border-b pb-4 mb-4">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationsListing />
        </SheetContent>
      </Sheet>
    </div>
  );
}
