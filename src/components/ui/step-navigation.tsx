'use client';

import * as React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export interface StepNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'compact';
  allowClickCompletedSteps?: boolean;
  showStepNumbers?: boolean;
}

const StepNavigation = React.forwardRef<HTMLDivElement, StepNavigationProps>(
  (
    {
      className,
      steps,
      currentStepIndex,
      onStepClick,
      orientation = 'horizontal',
      variant = 'default',
      allowClickCompletedSteps = true,
      showStepNumbers = true,
      ...props
    },
    ref,
  ) => {
    const isVertical = orientation === 'vertical';
    const isCompact = variant === 'compact';

    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-auto scrollbar-none',
          isVertical ? 'py-2' : 'flex py-4 px-4',
          className,
        )}
        {...props}
      >
        <div
          className={cn(isVertical ? 'space-y-4' : 'flex items-start gap-2 min-w-full')}
        >
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isPending = index > currentStepIndex;
            const isClickable =
              (isCompleted && allowClickCompletedSteps) || (onStepClick && !isPending);

            return (
              <div
                key={step.id}
                className={cn(
                  'relative group',
                  isVertical ? 'flex items-start' : 'flex-1',
                  isClickable && 'cursor-pointer',
                  !isVertical && isCompact && 'min-w-[4rem]',
                )}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(index);
                  }
                }}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-colors',
                    'touch-manipulation text-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground',
                    isCompact ? 'size-8' : 'size-10',
                    isClickable && 'active:scale-95',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className={cn(isCompact ? 'size-5' : 'size-6')} />
                  ) : (
                    <span
                      className={cn('font-medium', isCompact ? 'text-sm' : 'text-base')}
                    >
                      {showStepNumbers ? index + 1 : null}
                    </span>
                  )}
                </div>

                {/* Step content */}
                <div
                  className={cn(
                    'flex flex-col',
                    isVertical ? 'ml-3' : isCompact ? 'mt-2 text-center w-full' : 'ml-3',
                  )}
                >
                  <span
                    className={cn(
                      'font-medium truncate',
                      isCompact ? 'text-sm' : 'text-base',
                      isActive
                        ? 'text-foreground'
                        : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {!isCompact && step.description && (
                    <span className="text-sm text-muted-foreground truncate mt-1 max-w-[20ch] sm:max-w-none">
                      {step.description}
                    </span>
                  )}
                  {step.optional && !isCompact && (
                    <span className="text-xs text-muted-foreground italic mt-1">
                      (Optional)
                    </span>
                  )}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'bg-border',
                      isVertical
                        ? 'absolute left-4 top-10 h-full w-0.5'
                        : isCompact
                          ? 'flex-1 h-px mt-4 mx-1'
                          : 'flex-1 h-px mt-5 mx-2',
                    )}
                  ></div>
                )}

                {/* Direction indicator */}
                {!isVertical && !isCompact && index < steps.length - 1 && (
                  <div className="text-muted-foreground hidden sm:block">
                    <ChevronRight className="size-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
StepNavigation.displayName = 'StepNavigation';

export { StepNavigation };
