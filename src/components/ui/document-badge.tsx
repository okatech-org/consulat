import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type DocumentStatus =
  | 'required'
  | 'optional'
  | 'uploaded'
  | 'verified'
  | 'rejected'
  | 'expired';

interface DocumentBadgeProps {
  name: string;
  status: DocumentStatus;
  expiryDate?: Date;
  className?: string;
}

export function DocumentBadge({
  name,
  status,
  expiryDate,
  className,
}: DocumentBadgeProps) {
  const t = useTranslations('common.documents');

  const statusConfig = {
    required: {
      icon: AlertCircle,
      class: 'border-red-200 bg-red-50 text-red-700',
    },
    optional: {
      icon: FileText,
      class: 'border-gray-200 bg-gray-50 text-gray-700',
    },
    uploaded: {
      icon: Clock,
      class: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    },
    verified: {
      icon: CheckCircle2,
      class: 'border-green-200 bg-green-50 text-green-700',
    },
    rejected: {
      icon: AlertCircle,
      class: 'border-red-200 bg-red-50 text-red-700',
    },
    expired: {
      icon: AlertCircle,
      class: 'border-orange-200 bg-orange-50 text-orange-700',
    },
  };

  const IconComponent = statusConfig[status].icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-1',
        statusConfig[status].class,
        className,
      )}
    >
      <IconComponent className="size-4" />
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs">
        {t(`status.${status}`)}
        {expiryDate && status === 'expired' && (
          <span className="ml-1">
            {t('expired_on', { date: expiryDate.toLocaleDateString() })}
          </span>
        )}
      </span>
    </div>
  );
}
