import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { CheckCircle, Clock, AlertTriangle, XCircle, RefreshCcw } from 'lucide-react';

type StatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'expired'
  | 'incomplete'
  | 'verified'
  | 'review';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const t = useTranslations('common.status');

  const statusConfig = {
    pending: {
      icon: Clock,
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    approved: {
      icon: CheckCircle,
      class: 'bg-green-100 text-green-800 border-green-200',
    },
    rejected: {
      icon: XCircle,
      class: 'bg-red-100 text-red-800 border-red-200',
    },
    processing: {
      icon: RefreshCcw,
      class: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    expired: {
      icon: AlertTriangle,
      class: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    incomplete: {
      icon: AlertTriangle,
      class: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    verified: {
      icon: CheckCircle,
      class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    review: {
      icon: Clock,
      class: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const IconComponent = statusConfig[status].icon;

  return (
    <motion.span
      {...fadeIn}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        statusConfig[status].class,
        sizeStyles[size],
        className,
      )}
    >
      {showIcon && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: status === 'processing' ? 360 : 0 }}
          transition={{
            duration: 2,
            repeat: status === 'processing' ? Infinity : 0,
            ease: 'linear',
          }}
        >
          <IconComponent
            className={cn(
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5',
            )}
          />
        </motion.div>
      )}
      {t(status)}
    </motion.span>
  );
}
