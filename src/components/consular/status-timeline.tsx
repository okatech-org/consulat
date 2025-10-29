'use client';

import { RequestStatus } from '@/convex/lib/constants';
import { Check } from 'lucide-react';
import { STATUS_ORDER } from '@/lib/validations/status-transitions';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  className?: string;
}

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  const t = useTranslations('inputs.requestStatus.options');
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className={cn('relative w-full overflow-x-auto', className)}>
      <div className="min-w-[600px] md:min-w-full">
        {/* Ligne de connexion */}
        <div className="absolute left-0 right-0 top-5 h-[2px] bg-border" />

        {/* Étapes */}
        <div className="relative flex justify-between gap-4">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <TooltipProvider key={status}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn('flex flex-1 flex-col items-center gap-2', {
                        'cursor-not-allowed': isPending,
                      })}
                    >
                      {/* Cercle avec numéro ou check */}
                      <div
                        className={cn(
                          'relative z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border text-xs md:text-sm font-medium',
                          {
                            'border-primary bg-primary text-primary-foreground':
                              isCompleted,
                            'border-primary bg-background text-primary': isCurrent,
                            'border-muted bg-background text-muted-foreground': isPending,
                          },
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Label */}
                      <p
                        className={cn(
                          'text-center text-xs md:text-sm font-medium break-words max-w-[80px] md:max-w-none',
                          {
                            'text-primary': isCurrent,
                            'text-muted-foreground': isPending,
                          },
                        )}
                      >
                        {t(status)}
                      </p>
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}
