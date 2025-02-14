import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { LoaderIcon } from 'lucide-react';

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'default' | 'lg';
  centered?: boolean;
}

export function LoadingState({
  text,
  size = 'default',
  centered = true,
  className,
  ...props
}: LoadingStateProps) {
  const t = useTranslations('common');

  return (
    <div
      className={cn('flex items-center gap-2', centered && 'justify-center', className)}
      {...props}
    >
      <LoaderIcon
        className={cn(
          'animate-spin',
          size === 'sm' && 'h-4 w-4',
          size === 'default' && 'h-6 w-6',
          size === 'lg' && 'h-8 w-8',
        )}
      />
      <span className="text-muted-foreground">{text || t('loading')}</span>
    </div>
  );
}
