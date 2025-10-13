import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RequestStatus } from '@/convex/lib/constants';

interface ProfileStatusBadgeProps {
  status: RequestStatus;
  label?: string;
  className?: string;
}

export function ProfileStatusBadge({
  status,
  label,
  className,
}: ProfileStatusBadgeProps) {
  const t = useTranslations('inputs');

  const getStatusStyles = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.Draft:
        return 'bg-muted text-muted-foreground';
      case RequestStatus.Submitted:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
      case RequestStatus.Validated:
        return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
      case RequestStatus.Rejected:
        return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn('font-medium', getStatusStyles(status), className)}
    >
      {label ? label : status ? t(`profileStatus.options.${status}`) : ''}
    </Badge>
  );
}
