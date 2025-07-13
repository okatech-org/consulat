'use client';

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
  const getBadgeStyles = (percentage: number) => {
    if (percentage >= 80) return 'bg-blue-500/10 text-blue-500';
    if (percentage >= 50) return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-red-500/10 text-red-500';
  };

  const getTooltipMessage = (percentage: number) => {
    if (percentage >= 80) return 'Profil complété à ' + percentage + '%';
    if (percentage >= 50) return 'Profil en cours de completion (' + percentage + '%)';
    return 'Profil incomplet (' + percentage + '%)';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full text-xs font-medium min-w-[2.5rem] h-5 px-2',
              getBadgeStyles(percentage),
              className,
            )}
          >
            {percentage}%
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipMessage(percentage)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
