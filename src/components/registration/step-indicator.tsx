import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  key: string;
  title: string;
  description: string;
  isComplete: boolean;
  isOptional?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onChange: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onChange }: StepIndicatorProps) {
  const t = useTranslations('registration');

  return (
    <div className="relative ">
      {/* Barre de progression */}
      <div className="absolute left-0 top-[15px] h-[2px] w-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Étapes */}
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCurrent = currentStep === index;
          const isComplete = step.isComplete;
          const canAccess = index <= currentStep || isComplete;

          return (
            <button
              key={step.key}
              onClick={() => canAccess && onChange(index)}
              disabled={!canAccess}
              className={cn(
                'flex flex-col items-center',
                !canAccess && 'cursor-not-allowed opacity-50',
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
        <p className="font-medium">{steps[currentStep].title}</p>
        {steps[currentStep].isOptional && (
          <span className="text-sm text-muted-foreground">({t('steps.optional')})</span>
        )}
      </div>
    </div>
  );
}
