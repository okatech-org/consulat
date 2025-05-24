import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import CardContainer from '../layouts/card-container';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  return (
    <CardContainer
      title={title}
      action={
        <div className={cn('p-2 rounded-md', iconClassName)}>
          <Icon className="size-icon" />
        </div>
      }
      className={className}
      contentClass="!pt-0"
      headerClass="border-b-0"
    >
      <div className="text-2xl font-bold">{value}</div>
      {(description || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'text-xs',
                trend.isPositive ? 'text-green-500' : 'text-red-500',
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {trend.value}%
            </span>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
    </CardContainer>
  );
}
