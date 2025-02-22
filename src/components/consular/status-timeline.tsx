'use client';

import { RequestStatus } from '@prisma/client';
import { Check, Clock } from 'lucide-react';
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
    <div className={cn('space-y-8', className)}>
      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-muted" />

        {/* Étapes */}
        <div className="relative space-y-8">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const transitionCheck = canSwitchTo(status, request, profile);

            return (
              <TooltipProvider key={status}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn('flex items-center gap-3', {
                        'opacity-40': isPending,
                        'cursor-not-allowed': !transitionCheck.can && isPending,
                      })}
                    >
                      {/* Indicateur */}
                      <div
                        className={cn(
                          'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border',
                          {
                            'border-primary bg-primary text-primary-foreground':
                              isCompleted,
                            'border-primary bg-background': isCurrent,
                            'border-muted bg-background': isPending,
                          },
                        )}
                      >
                        {isCompleted && <Check className="h-5 w-5" />}
                        {isCurrent && <Clock className="h-5 w-5 text-primary" />}
                        {isPending && <div className="h-2 w-2 rounded-full bg-muted" />}
                      </div>

                      {/* Label */}
                      <div className="flex min-h-[2.5rem] flex-col justify-center">
                        <p className="text-sm font-medium leading-none">
                          {t(status.toLowerCase())}
                        </p>
                      </div>
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
    </div>
  );
}
