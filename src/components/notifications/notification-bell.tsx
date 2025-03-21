'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';

const BellIcon = ({ animate, className }: { animate?: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={cn('w-6 h-6', className, {
      'animate-[bell-ring_0.5s_ease-in-out]': animate,
    })}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

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
  const { unreadCount, isLoading } = useNotifications();

  return (
    <div className={cn('relative inline-block', className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        role="button"
        aria-label={title}
        tabIndex={0}
        className="rounded-full hover:bg-muted transition-colors"
      >
        <BellIcon animate={isLoading} className={bellClassName + ' size-icon'} />

        <AnimatePresence>
          {unreadCount > 0 && (
            <div className="absolute aspect-square size-2 bg-red-500 rounded-full top-0 right-[1%]">
              <span className="sr-only">{unreadCount}</span>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
