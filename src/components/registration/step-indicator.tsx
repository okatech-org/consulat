import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step<T extends string> {
  key: T;
  title: string;
  description: string;
  isComplete: boolean;
  isOptional?: boolean;
}

interface StepIndicatorProps<T extends string> {
  steps: Step<T>[];
  currentStep: T;
  onChange: (step: T) => void;
  variant?: 'horizontal' | 'vertical';
}

export function StepIndicator<T extends string>({
  steps,
  currentStep,
  onChange,
  variant = 'horizontal',
}: StepIndicatorProps<T>) {
  const t = useTranslations('registration');
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep) ?? 0;

  if (variant === 'vertical') {
    return (
      <div className="relative">
        {/* Barre de progression verticale */}
        <div className="absolute left-[15px] top-0 w-[2px] h-full bg-muted">
          <motion.div
            className="w-full bg-primary"
            initial={{ height: '0%' }}
            animate={{
              height: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Étapes verticales */}
        <div className="relative z-10 flex flex-col space-y-8">
          {steps.map((step, index) => {
            const isCurrent = currentStep === step.key;
            const isComplete = step.isComplete;
            const canAccess = index <= currentStepIndex || isComplete;

            return (
              <button
                key={step.key}
                onClick={() => canAccess && onChange(step.key)}
                disabled={!canAccess}
                className={cn(
                  'flex items-center gap-4 text-left w-full',
                  !canAccess && 'cursor-not-allowed',
                )}
              >
                {/* Indicateur */}
                <motion.div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    !isCurrent && !isComplete && 'border-muted bg-background',
                  )}
                  whileHover={canAccess ? { scale: 1.05 } : undefined}
                  whileTap={canAccess ? { scale: 0.95 } : undefined}
                >
                  {isComplete ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </motion.div>

                {/* Label et description */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      !canAccess && 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                    {step.isOptional && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({t('steps.optional')})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Version horizontale (existante)
  return (
    <div className="relative">
      {/* Barre de progression */}
      <div className="absolute left-0 top-[15px] h-[2px] w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Étapes */}
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCurrent = currentStep === step.key;
          const isComplete = step.isComplete;
          const canAccess = index <= currentStepIndex || isComplete;

          return (
            <button
              key={step.key}
              onClick={() => canAccess && onChange(step.key)}
              disabled={!canAccess}
              className={cn(
                'flex flex-col items-center',
                !canAccess && 'cursor-not-allowed',
              )}
            >
              {/* Indicateur */}
              <motion.div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isComplete && 'border-primary bg-primary text-primary-foreground',
                  !isCurrent && !isComplete && 'border-muted bg-background',
                )}
                whileHover={canAccess ? { scale: 1.05 } : undefined}
                whileTap={canAccess ? { scale: 0.95 } : undefined}
              >
                {isComplete ? (
                  <Check className="size-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-2 hidden text-center md:block">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    !canAccess && 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </p>
                {step.isOptional && (
                  <span className="text-xs text-muted-foreground">
                    ({t('steps.optional')})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Titre de l'étape courante (mobile) */}
      <div className="mt-4 text-center md:hidden">
        <p className="font-medium">{steps[currentStepIndex]?.title}</p>
        {steps[currentStepIndex]?.isOptional && (
          <span className="text-sm text-muted-foreground">({t('steps.optional')})</span>
        )}
      </div>
    </div>
  );
}
