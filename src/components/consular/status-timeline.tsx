'use client';

import { RequestStatus } from '@prisma/client';
import { Check } from 'lucide-react';
import { STATUS_ORDER, canSwitchTo } from '@/lib/validations/status-transitions';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FullServiceRequest } from '@/types/service-request';
import { FullProfile } from '@/types/profile';

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  request: FullServiceRequest;
  profile: FullProfile;
  className?: string;
}

export function StatusTimeline({
  currentStatus,
  request,
  profile,
  className,
}: StatusTimelineProps) {
  const t = useTranslations('common.status');
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className={cn('relative', className)}>
      {/* Ligne de connexion */}
      <div className="absolute left-0 right-0 top-5 h-[2px] bg-border" />

      {/* Étapes */}
      <div className="relative flex justify-between">
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const transitionCheck = canSwitchTo(status, request, profile);

          return (
            <TooltipProvider key={status}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn('flex flex-col items-center gap-2', {
                      'cursor-not-allowed': !transitionCheck.can && isPending,
                    })}
                  >
                    {/* Cercle avec numéro ou check */}
                    <div
                      className={cn(
                        'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium',
                        {
                          'border-primary bg-primary text-primary-foreground':
                            isCompleted,
                          'border-primary bg-background text-primary': isCurrent,
                          'border-muted bg-background text-muted-foreground': isPending,
                        },
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <p
                      className={cn('text-sm font-medium', {
                        'text-primary': isCurrent,
                        'text-muted-foreground': isPending,
                      })}
                    >
                      {t(status.toLowerCase())}
                    </p>
                  </div>
                </TooltipTrigger>
                {isPending && !transitionCheck.can && (
                  <TooltipContent>
                    <p>{transitionCheck.reason}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
