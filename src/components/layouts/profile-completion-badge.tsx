'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ProfileCompletionBadgeProps {
  percentage: number;
  className?: string;
}

export function ProfileCompletionBadge({
  percentage,
  className,
}: ProfileCompletionBadgeProps) {
  const getVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  const getColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getVariant(percentage)}
            className={cn('ml-auto', getColor(percentage), className)}
          >
            {percentage}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Profil complété à {percentage}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
